#include <iostream>

#include <v8.h>

#include <node.h>
#include <node_object_wrap.h>

#include <mosquitto.h>

using namespace node;
using namespace v8;

static Persistent<String> symbol_connected;
static Persistent<String> symbol_disconnected;
static Persistent<String> symbol_error;
static Persistent<String> symbol_data;
static Persistent<String> symbol_unknown;

class Connection : ObjectWrap {
public:
    Connection() {}
    
    ~Connection() {}
    
    static Persistent<FunctionTemplate> persistent_function_template;
    
    static void Init (Handle<Object> target) {
        HandleScope scope;
        
        Local<FunctionTemplate> local_function_template = FunctionTemplate::New(New);
        Connection::persistent_function_template = Persistent<FunctionTemplate>::New(local_function_template);
        Connection::persistent_function_template->InstanceTemplate()->SetInternalFieldCount(1);
        Connection::persistent_function_template->SetClassName(String::NewSymbol("Connection"));
        
        NODE_SET_PROTOTYPE_METHOD(Connection::persistent_function_template, "connect", Connect);
        /*NODE_SET_PROTOTYPE_METHOD(t, "close", receiveData);
        /*NODE_SET_PROTOTYPE_METHOD(t, "subscribe", Subscribe);
        NODE_SET_PROTOTYPE_METHOD(t, "publish", Publish);
        */
        symbol_connected        = NODE_PSYMBOL("connected");
        symbol_disconnected     = NODE_PSYMBOL("disconnected");
        symbol_error            = NODE_PSYMBOL("error");
        symbol_data             = NODE_PSYMBOL("data");

        target->Set(String::NewSymbol("Connection"), Connection::persistent_function_template->GetFunction());
    }
    
    static Handle<Value> New(const Arguments& args) {
        HandleScope scope;
        Connection* connection = new Connection();
        connection->Wrap(args.This());
        
        std::cout << args.Length() << std::endl;
                
        return args.This();
    }
    
    static Handle<Value> Connect(const Arguments& args) {
        HandleScope scope;
        Connection* connection = ObjectWrap::Unwrap<Connection>(args.This());
        
        Local<Value> argv[1] = { String::NewSymbol("data") };
        
        Local<Value> emit_v = connection->handle_->Get(symbol_connected);
        assert(emit_v->IsFunction());
        Local<Function> emit = Local<Function>::Cast(emit_v);
        TryCatch tc;
        emit->Call(connection->handle_, 3, argv);
        if (tc.HasCaught()) {
                // propagate error
        }
        
        Local<String> result = String::New("Hello World");
        
        return scope.Close(result);
    }
    
    void receiveData () {
        Local<Value> emit_v = handle_->Get(symbol_data);
        if (!emit_v->IsFunction()) return;
        Local<Function> emit = Local<Function>::Cast(emit_v);
        TryCatch tc;
        
        Local<Value> argv[1] = { String::NewSymbol("data") };
        
        emit->Call(handle_, 3, argv);
        if (tc.HasCaught()) {
          // propagate error
        }
    }
};

Persistent<FunctionTemplate> Connection::persistent_function_template;

extern "C" { // Cause of name mangling in C++, we use extern C here
    static void init(Handle<Object> target) {
        Connection::Init(target);
    }
    // @see http://github.com/ry/node/blob/v0.2.0/src/node.h#L101
    NODE_MODULE(Connection, init);
}