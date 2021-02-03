import * as Event from 'events'
import * as protobuf from 'protobufjs';
import { message } from './pine_msg/compiled'
import { TextDecoder, TextEncoder } from './en_decoder';

const CompressDataMap: ProtoMap = {}
const PineMsg = message.PineMsg
const PineErrMsg = message.PineErrResp
const Root = protobuf.Root;

// 给protobuf添加一个方法
(protobuf as any).loadFromString = (name: string, protoStr: string) => {
    const fetchFunc = Root.prototype.fetch;
    Root.prototype.fetch = (_, cb) => cb(null, protoStr);
    const root = new Root().load(name);
    Root.prototype.fetch = fetchFunc;
    return root;
};

const requestMap = {}
const MaxRequestID = 50000;
const FetchCompressMetadataHandler = '__CompressMetadata__'

let RequestID = 1

const ServerCodeMap: {
    kindToCode: { [serverKind: string]: number },
    codeToKind: { [serverCode: number]: string }
} = {
    kindToCode: {},
    codeToKind: {}
}

export interface HandlerMap {
    handlerToCode: { [handler: string]: number },
    codeToHandler: { [code: number]: string },
}

export interface EventMap {
    eventToCode: { [event: string]: number },
    codeToEvent: { [code: number]: string },
}

interface CompressMetadata {
    Code?: number;
    Message?: string;
    serverCode: number,
    serverKind: string,
    proto: string,
    handlers: string[],
    events: string[],
}

export interface ProtoMap {
    [serverKind: string]: {
        protoRoot: protobuf.Root,
        handlers: HandlerMap
        events: EventMap
        data: CompressMetadata
    }
}

type Resp = {
    Code: number;
    Message: string;
    [key: string]: any;
    [key: number]: any;
}

export type Middleware = (data: Resp) => boolean

export abstract class BasePine extends Event.EventEmitter {
    protected abstract ws: any;
    public static ReqTimeOut = 60 * 1000
    // Request 请求
    public request(route: string, reqData: any, ...middlewares: Middleware[]) {

        const { buffer } = this.sendMessage(route, reqData, RequestID);

        this.ws.send(buffer, { binary: true })

        // 返回Promise
        return new Promise<any>(resolve => {

            const requestId = RequestID

            const timeOutHandler = setTimeout(() => {
                if (requestMap[requestId]) {
                    delete requestMap[requestId]
                }
                console.error(`${route}: Response time out, data: ${JSON.stringify(reqData)}`)
            }, BasePine.ReqTimeOut);

            // 设置回调函数
            requestMap[requestId] = async (respData) => {
                clearTimeout(timeOutHandler)
                for (const middleware of middlewares) {
                    const isContinue = await middleware(respData)
                    if (!isContinue) {
                        return
                    }
                }
                resolve(respData)
            }


            // RequestID自增
            RequestID++
            if (RequestID >= MaxRequestID) {
                RequestID = 1
            }
        })
    }

    // Notify 无回复通知
    public notify(route: string, data: any) {

        const { buffer } = this.sendMessage(route, data);

        this.ws.send(buffer, { binary: true })
    }

    // 发送消息
    private sendMessage(route: string, data: any, requestID = 0) {
        const [serverKind, handler] = route.split('.');

        // 检查是否有先获取proto文件
        if (handler !== FetchCompressMetadataHandler && !CompressDataMap[serverKind]) {
            throw new Error(`Please exec 'await pine.fetchCompressMetadata("${serverKind}");' first`);
        }

        // 路由压缩
        try {
            const serverKindCode = ServerCodeMap.kindToCode[serverKind];
            const handlerCode = CompressDataMap[serverKind].handlers.handlerToCode[handler];
            if (serverKindCode && handlerCode) {
                route = new TextDecoder().decode(new Uint8Array([serverKindCode, handlerCode]));
            }
        } catch (e) {
            //
        }

        // 获取protobuf.Root
        const protoRoot = CompressDataMap[serverKind] ? CompressDataMap[serverKind].protoRoot : undefined;
        let ProtoType;
        try {
            // 查找是否有对应的protobuf.Type
            ProtoType = protoRoot.lookupType(route);
        } catch (e) {
            // console.log(`${route}'s proto message is not found.`)
        }

        let encodedData: Uint8Array;
        if (ProtoType) {
            // 有对应的protobuf.Type，则使用protobuf压缩数据
            encodedData = ProtoType.encode(data).finish();
        } else {
            // 没有则使用JSON传输数据
            encodedData = new TextEncoder().encode(JSON.stringify(data));
        }

        // 包装成Pine数据包
        const msesage = PineMsg.create({
            Route: route,
            RequestID: requestID,
            Data: encodedData
        });

        // 转成byte[],发送
        const buffer = PineMsg.encode(msesage).finish();
        return { buffer, route };
    }

    // 获取proto文件
    public async fetchCompressMetadata(serverKind: string, forceUpdate: boolean = false) {

        const isSkipProto = !forceUpdate && CompressDataMap[serverKind] && CompressDataMap[serverKind].protoRoot

        const data: CompressMetadata = await this.request(`${serverKind}.${FetchCompressMetadataHandler}`, { skipProto: isSkipProto })

        if (data.Code) {
            throw new Error(JSON.stringify(data))
        }

        // ServerCode Map
        ServerCodeMap.codeToKind[data.serverCode] = data.serverKind
        ServerCodeMap.kindToCode[data.serverKind] = data.serverCode

        // ServerKind
        serverKind = data.serverKind

        if (data.proto) {
            // Protobuf
            this.loadProtoFromString(serverKind, data.proto)
        }

        // HandlerMap
        const handlers: HandlerMap = { handlerToCode: {}, codeToHandler: {} }
        if (data.handlers && data.handlers instanceof Array) {
            data.handlers.forEach((handler, index) => {
                const code = index + 1
                handlers.handlerToCode[handler] = code
                handlers.codeToHandler[code] = handler
            })
        }

        // EventMap
        const events: EventMap = { eventToCode: {}, codeToEvent: {} }
        if (data.events && data.events instanceof Array) {
            data.events.forEach((event, index) => {
                const code = index + 1
                events.eventToCode[event] = code
                events.codeToEvent[code] = event
            })
        }

        if (CompressDataMap[serverKind]) {
            // 存在旧的protoRoot并且没有新的proto数据则不更新protoRoot
            CompressDataMap[serverKind].handlers = handlers
            CompressDataMap[serverKind].events = events
            CompressDataMap[serverKind].data = data
        } else {
            CompressDataMap[serverKind] = {
                protoRoot: null,
                handlers,
                events,
                data,
            }
        }

        return data
    }

    // 处理消息
    public onMessage(data) {

        try {

            // 消息解析
            const message = PineMsg.decode(data as Buffer)
            // 转成JSON
            const result = message.toJSON()
            // 获取byte[]类型的路由信息
            const routeBytes = new TextEncoder().encode(result.Route)

            if (routeBytes.length === 2) { // 路由经过压缩
                // 获取对应的ServerKind
                const serverKind = ServerCodeMap.codeToKind[routeBytes[0]]

                if (result.RequestID) {
                    // 如果是request获取相应的Handler
                    const handler = CompressDataMap[serverKind].handlers.codeToHandler[routeBytes[1]]
                    // 恢复成原始路由
                    result.Route = `${serverKind}.${handler}`
                } else {
                    // 如果是事件获取相应的Event
                    const event = CompressDataMap[serverKind].events.codeToEvent[routeBytes[1]]
                    // 恢复成原始路由
                    result.Route = `${serverKind}.${event}`
                }

            }

            // ServerKind
            const serverKind = result.Route.split('.')[0]
            // protoRoot
            const protoRoot = CompressDataMap[serverKind] ? CompressDataMap[serverKind].protoRoot : undefined

            let ProtoType

            if (result.RequestID) {// request对应的response
                // 获取对应的对调函数
                const cb = requestMap[result.RequestID]
                if (cb) {
                    delete requestMap[result.RequestID]

                    try {
                        // 查找是否有对应的protobuf.Type
                        ProtoType = protoRoot.lookupType(result.Route + 'Resp')
                    } catch (e) {
                        // console.log(`${result.Route}'s proto message is not found.`, e)
                    }

                    let data
                    // 解析数据
                    try {
                        data = this.parseData(ProtoType, message);
                    } catch (e) {
                        data = PineErrMsg.decode(message.Data)
                    }
                    // 执行回掉函数
                    cb(data)

                } else {
                    // 如果找不到回调函数则报一个错
                    console.error('No response callback;', result)
                }
            } else { // 服务端主动下发的Event

                try {
                    // 查找是否有对应的protobuf.Type
                    ProtoType = protoRoot.lookupType(result.Route)
                } catch (e) {
                    // console.log(`${result.Route}'s proto message is not found.`)
                }
                // 解析数据
                const data = this.parseData(ProtoType, message);
                // 触发事件
                this.emit(result.Route, data)

            }

        } catch (e) {
            console.error(e, '\nData:', JSON.stringify(data))
        }

    }

    // 解析消息
    private parseData(ProtoType: any, message: message.PineMsg) {
        let data;
        if (ProtoType) {
            // 如果有则使用protobuf.Type解析数据
            data = ProtoType.decode(message.Data);
        } else {
            // 否则尝试使用JSON格式解析数据
            data = new TextDecoder().decode((message.Data));
            data = JSON.parse(data);
        }
        return data;
    }

    // 从string中加载proto（eg. CDN）
    public async loadProtoFromString(serverKind: string, protoStr: string) {

        if (!protoStr) {
            throw new Error('Proto string can not be empty')
        }

        const originPackage = /package +\w+;/
        const metchResult = protoStr.match(/package +\w+;/)
        if (!metchResult) {
            throw new Error('Proto string must contain package')
        }

        const correctPackage = `package ${serverKind};`
        const reg = new RegExp(`package +${serverKind};`)
        if (!protoStr.match(reg)) {
            const err = new Error(`Proto package is not correct, Plaease change '${metchResult[0]}' to '${correctPackage}'`)
            console.error(err)
            protoStr = protoStr.replace(originPackage, correctPackage)
        }

        const protoRoot = await (protobuf as any).loadFromString(serverKind, protoStr)

        if (CompressDataMap[serverKind]) {
            CompressDataMap[serverKind].protoRoot = protoRoot
        } else {
            CompressDataMap[serverKind] = {
                protoRoot,
                handlers: null,
                events: null,
                data: null,
            }
        }
    }
}


