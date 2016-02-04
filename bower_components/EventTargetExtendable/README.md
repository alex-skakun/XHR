# EventTargetExtendable
Base class, that can add functionality of events to your classes in code for browser.

## How to use

    function YourClass (someArgs) {
    
        // object initialization
    
    }
    
    // YourClass extends EventTargetExtendable
    YourClass.prototype = Object.create(EventTargetExtendable.prototype, {
        constructor: {
            value: YourClass
        }
    });
    
    // define YourClass methods below 
    
    
    var yourInstance = new YourClass();
    
    yourInstance.addEventListener('eventname', function (eventArgs) {
        // event handler actions
    });
    
    // somewhere in code
    yourInstance.dispatchEvent('eventname', eventArgs [, eventArgs2, ...]);
    
    
    
    
    
