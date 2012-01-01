// Copyright (c) Microsoft Corporation.  All rights reserved.
// This code is licensed by Microsoft Corporation under the terms
// of the MICROSOFT REACTIVE EXTENSIONS FOR JAVASCRIPT AND .NET LIBRARIES License.
// See http://go.microsoft.com/fwlink/?LinkId=186234.

// Copyright (c) Microsoft Corporation.  All rights reserved.
// This code is licensed by Microsoft Corporation under the terms
// of the MICROSOFT REACTIVE EXTENSIONS FOR JAVASCRIPT AND .NET LIBRARIES License.
// See http://go.microsoft.com/fwlink/?LinkId=186234.

(function(global, undefined) {
    var root = global.Rx,
        observable = root.Observable,
        observableCreateWithDisposable = observable.createWithDisposable,
        disposableCreate = root.Disposable.create,
        CompositeDisposable = root.CompositeDisposable,
        RefCountDisposable = root.RefCountDisposable,
        AsyncSubject = root.AsyncSubject,

    fromMooToolsEvent = observable.fromMooToolsEvent = function(mooToolsObject, eventType) {
        return observable.Create(function(observer) {
            var handler = function(eventObject) {
                observer.onNext(eventObject);
            };
            mooToolsObject.addEvent(eventType, handler);
            return function() {
                mooToolsObject.removeEvent(eventType, handler);
            };
        });
    },
    
    mooToolsToObservable = function(type) {
        return fromMooToolsEvent(this, type);
    };
    
    Window.implement({
        addEventAsObservable : fromMooToolsEvent
    });
    
    Document.implement({
        addEventAsObservable : fromMooToolsEvent
    });    
    
    Element.implement({
        addEventAsObservable : fromMooToolsEvent
    });  
    
    Elements.implement({
        addEventAsObservable : fromMooToolsEvent
    });     
    
    Events.implement({
        addEventAsObservable : fromMooToolsEvent
    });      
   
    var mooToolsRequest = observable.createMooToolsRequest = function(options) {
        var subject = new AsyncSubject(), request, refCount;
        options.onSuccess = function(responseText, responseXML) {
            subject.onNext({ responseText: responseText, responseXML: responseXML });
            subject.onCompleted();
        };
        options.onFailure = function(xhr) {
            subject.onError({ kind: 'failure', xhr: xhr });
        };  
        options.onException = function(headerName, value) {
            subject.onError({ kind: 'exception', headerName: headerName, value: value });
        };        
        try {
            request = new Request(options);
            request.send();
        } catch(e) {
            subject.onError(e);
        }
        refCount = new RefCountDisposable(disposableCreate(function() {
            if(request) {
                request.cancel();
            }
        }));
        return observableCreateWithDisposable(function(subscriber) {
            return new CompositeDisposable(subject.subscribe(subscriber), refCount.getDisposable());
        });
    };
    
    Request.implement({
        toObservable: function () {
            var subject = new AsyncSubject(), request = this, refCount;
            request.addEvents({
                success: function(responseText, responseXML) {
                    subject.onNext({ responseXML: responseXML, responseText: responseText });
                    subject.onCompleted();
                },
                failure: function(xhr) {
                    subject.onError({ kind: 'failure', xhr: xhr });
                },
                exception: function(headerName, value) {
                    subject.onError({ kind: 'exception', headerName: headerName, value: value });
                }
            });            
            try {
                request.send();
            } catch (e) {
                subject.onError(e);
            }
            refCount = new RefCountDisposable(disposableCreate(function () {
                request.cancel();
            }));
            return observableCreateWithDisposable(function (subscriber) {
                return new CompositeDisposable(subject.subscribe(subscriber), refCount.getDisposable());
            });
        }        
    });    

    observable.createMooToolsJSONRequest = function(options) {
        var subject = new AsyncSubject(), request, refCount;
        options.onSuccess = function(responseJSON, responseText) {
            subject.onNext({ responseJSON: responseJSON, responseText: responseText });
            subject.onCompleted();
        };
        options.onFailure = function(xhr) {
            subject.onError({ kind: 'failure', xhr: xhr });
        };
        options.onException = function(headerName, value) {
            subject.onError({ kind: 'exception', headerName: headerName, value: value });
        };        
        try {
            request = new Request(newOptions);
            request.send();
        } catch(e) {
            subject.onError(e);
        }
        refCount = new RefCountDisposable(disposableCreate(function() {
            if(request) {
                request.cancel();
            }
        }));
        return observableCreateWithDisposable(function(subscriber) {
            return new CompositeDisposable(subject.subscribe(subscriber), refCount.getDisposable());
        });
    };
    
    Request.JSON.implement({
        toObservable: function () {
            var subject = new root.AsyncSubject(), request = this, refCount;
            request.addEvents({
                success: function(responseJSON, responseText) {
                    subject.onNext({ responseJSON: responseJSON, responseText: responseText });
                    subject.onCompleted();
                },
                failure: function(xhr) {
                    subject.onError({ kind: 'failure', xhr: xhr });
                },
                exception: function(headerName, value) {
                    subject.onError({ kind: 'exception', headerName: headerName, value: value });
                }
            });            
            try {
                request.send();
            } catch (e) {
                subject.onError(e);
            }
            refCount = new RefCountDisposable(disposableCreate(function () {
                request.cancel();
            }));
            return observableCreateWithDisposable(function (subscriber) {
                return new CompositeDisposable(subject.subscribe(subscriber), refCount.getDisposable());
            });
        }        
    });     
    
    observable.createMooToolsHTMLRequest = function(options) {
        var subject = new AsyncSubject(), request, refCount;   
        options.onSuccess = function(html) {
            subject.onNext(html);
            subject.onCompleted();
        };
        options.onFailure = function(xhr) {
            subject.onError({ kind: 'failure', xhr: xhr });
        };
        options.onException = function(headerName, value) {
            subject.onError({ kind: 'exception', headerName: headerName, value: value });
        };              
        try {       
            request = new Request.HTML(newOptions);
            request.send();
        } catch(e) {
            subject.onError(e);
        }
        refCount = new RefCountDisposable(root.Disposable.Create(function() {
            if(request) {
                request.cancel();
            }
        }));

        return observableCreateWithDisposable(function(subscriber) {
            return new CompositeDisposable(subject.subscribe(subscriber), refCount.getDisposable());
        });    
    }
    
    Request.HTML.implement({
        toObservable: function () {
            var subject = new AsyncSubject(), request = this, refCount;
            request.addEvents({
                success: function(html) {
                    subject.onNext(html);
                    subject.onCompleted();
                },
                failure: function(xhr) {
                    subject.onError({ kind: 'failure', xhr: xhr });
                },
                exception: function(headerName, value) {
                    subject.onError({ kind: 'exception', headerName: headerName, value: value });
                }
            });            
            try {
                request.send();
            } catch (e) {
                subject.onError(e);
            }
            refCount = new RefCountDisposable(disposableCreate(function () {
                request.cancel();
            }));
            return observableCreateWithDisposable(function (subscriber) {
                return new CompositeDisposable(subject.subscribe(subscriber), refCount.getDisposable());
            });
        }        
    });     
    
    observable.createMooToolsJSONPRequest = function(options) {
        var subject = new AsyncSubject(), request, refCount;
        options.onSuccess = function(html) {
            subject.onNext(html);
            subject.onCompleted();
        };
        options.onFailure = function(xhr) {
            subject.onError({ kind: 'failure', xhr: xhr });
        };
        options.onException = function(headerName, value) {
            subject.onError({ kind: 'exception', headerName: headerName, value: value });
        };
        try {
            request = new Request.JSONP(options);
            request.send();
        } catch(e) {
            subject.onError(e);
        }
        refCount = new RefCountDisposable(disposableCreate(function() {
            if(request) {
                request.cancel();
            }
        }));
        return observableCreateWithDisposable(function(subscriber) {
            return new CompositeDisposable(subject.subscribe(subscriber), refCount.getDisposable());
        });    
    };
    
    Request.JSONP.implement({
        toObservable: function () {
            var subject = new AsyncSubject(), request = this, refCount;
            request.addEvents({
                success: function(data) {
                    subject.onNext(data);
                    subject.onCompleted();
                },
                failure: function(xhr) {
                    subject.onError({ kind: 'failure', xhr: xhr });
                },
                exception: function(headerName, value) {
                    subject.onError({ kind: 'exception', headerName: headerName, value: value });
                }
            });            
            try {
                request.send();
            } catch (e) {
                subject.onError(e);
            }
            refCount = new RefCountDisposable(disposablecCreate(function () {
                request.cancel();
            }));
            return observableCreateWithDisposable(function (subscriber) {
                return new CompositeDisposable(subject.subscribe(subscriber), refCount.getDisposable());
            });
        }        
    });    
})(this);