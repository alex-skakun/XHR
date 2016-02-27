# EventTargetExtendable
Base class, that can add functionality of events to your classes in code for browser.

## How to use

    function YourClass (someArgs) {
        // You can define list of events (optional)
        EventTargetExtendable.call(this, [
            'start',
            'finish',
            'data'
        ]); 
    
    }
    
    // YourClass extends EventTargetExtendable
    YourClass.prototype = Object.create(EventTargetExtendable.prototype, {
        constructor: {
            value: YourClass
        }
    });
    
    var yourInstance = new YourClass();
    
    yourInstance.addEventListener('start', function (eventArgs) {
        // event handler actions
    });
    
    // somewhere in code
    yourInstance.dispatchEvent('start', eventArgs [, eventArgs2, ...]);
    
    // or you can use predefined event properties
    yourInstance.onstart = function (eventArgs) {
        // event handler actions
    };
    
##Instance methods

- addEventListener(eventType, listenerFunction) - Returns true if event listener has been added;
- removeEventListener(eventType, listenerFunction) - Returns true if event listener has been removed;
- removeAllListeners([eventType]) - Removes all event listeners or all listeners for specified eventType. Returns true if listeners have been removed;
- dispatchEvent(eventType[, eventArgs, eventArgs2, ...]) - Fires all event listener for specified type.
    
    
    
    
    
