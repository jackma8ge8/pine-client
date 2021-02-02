import * as $protobuf from "protobufjs";
/** Namespace message. */
export namespace message {

    /** Properties of a PineMsg. */
    interface IPineMsg {

        /** PineMsg Route */
        Route?: (string|null);

        /** PineMsg RequestID */
        RequestID?: (number|null);

        /** PineMsg Data */
        Data?: (Uint8Array|null);
    }

    /** Represents a PineMsg. */
    class PineMsg implements IPineMsg {

        /**
         * Constructs a new PineMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: message.IPineMsg);

        /** PineMsg Route. */
        public Route: string;

        /** PineMsg RequestID. */
        public RequestID: number;

        /** PineMsg Data. */
        public Data: Uint8Array;

        /**
         * Creates a new PineMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PineMsg instance
         */
        public static create(properties?: message.IPineMsg): message.PineMsg;

        /**
         * Encodes the specified PineMsg message. Does not implicitly {@link message.PineMsg.verify|verify} messages.
         * @param message PineMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: message.IPineMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PineMsg message, length delimited. Does not implicitly {@link message.PineMsg.verify|verify} messages.
         * @param message PineMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: message.IPineMsg, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PineMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PineMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): message.PineMsg;

        /**
         * Decodes a PineMsg message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PineMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): message.PineMsg;

        /**
         * Verifies a PineMsg message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PineMsg message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PineMsg
         */
        public static fromObject(object: { [k: string]: any }): message.PineMsg;

        /**
         * Creates a plain object from a PineMsg message. Also converts values to other types if specified.
         * @param message PineMsg
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: message.PineMsg, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PineMsg to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a PineErrResp. */
    interface IPineErrResp {

        /** PineErrResp Code */
        Code?: (number|null);

        /** PineErrResp Message */
        Message?: (string|null);
    }

    /** Represents a PineErrResp. */
    class PineErrResp implements IPineErrResp {

        /**
         * Constructs a new PineErrResp.
         * @param [properties] Properties to set
         */
        constructor(properties?: message.IPineErrResp);

        /** PineErrResp Code. */
        public Code: number;

        /** PineErrResp Message. */
        public Message: string;

        /**
         * Creates a new PineErrResp instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PineErrResp instance
         */
        public static create(properties?: message.IPineErrResp): message.PineErrResp;

        /**
         * Encodes the specified PineErrResp message. Does not implicitly {@link message.PineErrResp.verify|verify} messages.
         * @param message PineErrResp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: message.IPineErrResp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PineErrResp message, length delimited. Does not implicitly {@link message.PineErrResp.verify|verify} messages.
         * @param message PineErrResp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: message.IPineErrResp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PineErrResp message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PineErrResp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): message.PineErrResp;

        /**
         * Decodes a PineErrResp message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PineErrResp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): message.PineErrResp;

        /**
         * Verifies a PineErrResp message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PineErrResp message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PineErrResp
         */
        public static fromObject(object: { [k: string]: any }): message.PineErrResp;

        /**
         * Creates a plain object from a PineErrResp message. Also converts values to other types if specified.
         * @param message PineErrResp
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: message.PineErrResp, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PineErrResp to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
