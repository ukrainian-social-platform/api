## Ukrainian Cloud API

Ukrainian Cloud offers standard communication way via gRPC and web-compatible way via WebSockets utilyzing the same protobuf encoding as gRPC.

Protobuf definition is [here](./src/main.proto).

### gRPC API

There is no changes made to gRPC so you can use any gRPC-compatible client to communicate with the server.

### WebSocket API

WebSocket API is non-standard one. To connect to websocket, use server address (for example, `localhost:3000`) and path `/ws`. After the connection established you can send/receive messages. First message should be an init one (see [System messages](#system-messages)). After receiving successfull answer you may send other messages.

#### Message structure

Each message consist of one byte header and variable-length message body

##### Header

First 2 bits introduces compression algorithm or marks message as a system one:
- `00` — no compression
- `01` — deflate
- `10` — gzip
- `11` — system message, body should not be interpreted as a Protobuf payload

Next 6 bits specifies an identifier of the message. This gives a number of 64 maximum simultaneous requests. After getting a response (stream was closed) client should remove this id from used pool and mark it as free (re-usable). Identifiers stay the same during one RPC session. Once client generates the identifier and sends the message with it, all other messages with the same id goes to the same RPC session. Server responds with this id during all the session. This helps to identify message-session relationship.

##### Body

The body starts with 2 bytes identifiers of methods. Next data are a protobuf-encoded raw data. Protobuf-encoded data may be compressed as specified in the header.

###### System messages

First 4 bits specifies the type of the message. List of messages:
- `0000` — init message & init message response

Next bits differs by message

__Init message__  
Init message consists of version of the protocol to be initialized. Version convention will be followed during single websocket session. Current (active) version is `0000`.  
Next bits are the package name (lowercase) from `.proto` file encoded in [UCSE5 5-bit encoding](./UCSE5.md). For example, `ua.social_platform.api`.  
Next here goes a list of invokable methods. There is only need to specify services and methods that may be invoked. Non-used ones should be skipped to save memory. List of methods is constructed as a sequence of identifiers. Each identifier should be splitted with a dot (`.`) or slash (`/`). Slash splits services, while dot — identifiers inside the service. First identifier in each service sequence is a service identifier. Any other is method identifier. All the identifiers should be latin-only lowercase strings (w/o numbers or special symbols). Here is an example:

<blockquote>

Protobuf definition
```protobuf
service MyService {
	rpc MyFirstMethod (MyFirstMethodRequest) returns (MyFirstMethodReply) {}
	rpc MySecondMethod (MySecondMethodRequest) returns (MySecondMethodReply) {}
}

service MyNextService {
    rpc MyNextMethod (MyNextMethodRequest) returns (MyNextMethodReply) {}
}
```
should be represented with string
```
myservice.myfirstmethod.mysecondmethod/mynextservice.mynextmethod
```

</blockquote>

This string should be encoded in USCE5 before sending it in an init message.

---
Service and method positional indexes (UInt8) now should be used as a service/method ids. So each id will be a two-byte number. To use `MyService.MySecondMethod` from an example, first byte should be `0` and second one — `1`. This also means that maximum number of services is 256 and methods in one service — also 256.

__Init message response__  
Response should contain one of the answers to init message:
- `0000` — init failed
- `0001` — init success
