
/*
 * Samba Godschynski
 * similar to the generic midi controller, but cc's will not only 
 * sent it will also received. Tested with Behringer BCR2000.
 */

loadAPI(1);

host.defineController("Generic", "MIDI Controler Send/Receive", "1.0", "78d9e072-a464-4917-8ac9-cf552ffb58c7");
host.defineMidiPorts(1, 1);

var LOWEST_CC = 1;
var HIGHEST_CC = 119;
var currentPrj = null;

var ctrlValues = {}; // will be set by value observer

/* 
    we prevent midi loop backs by counting all in-events
    and check (a bit delayed) if all events was consumed, then we unlock
    by setting sendLock to 0. 
*/
var sendLock = 0;

function dprint(x) {
    //println(x)
}

function makeIndexFunction(index, f) {
    return function (value) {
        f(index, value);
    };
}

function init() {
    host.getMidiInPort(0).setMidiCallback(onMidi);
    generic = host.getMidiInPort(0).createNoteInput("", "??????");
    generic.setShouldConsumeEvents(false);
    app = host.createApplication();

    // Make CCs 1-119 freely mappable
    userControls = host.createUserControls(HIGHEST_CC - LOWEST_CC + 1);

    for (var i = LOWEST_CC; i <= HIGHEST_CC; i++) {
        var idx = i - LOWEST_CC;
        var ctrl = userControls.getControl(idx);
        ctrl.setLabel("CC" + i);
        ctrl.addValueObserver(127, makeIndexFunction(idx, function (i, value) {
            dprint("obsrv: " + i + "," + value);
            ctrlValues[i + 1] = value;
            var out = host.getMidiOutPort(0);
            if (sendLock == 0) {
                out.sendMidi(0xB0, i + 1, value); // send back to device
            } else {
                host.scheduleTask(function (data) { // check if we can unlock
                    if (data == sendLock) {
                        dprint("UNLOCK");
                        sendLock = 0;
                    }
                }, [sendLock], 1000);
            }
        }));
    }
}

function onMidi(status, data1, data2) {
    if (isChannelController(status)) {
        if (data1 >= LOWEST_CC && data1 <= HIGHEST_CC) {
            dprint("LOCK");
            sendLock++;
            var index = data1 - LOWEST_CC;
            //dprint(index);
            userControls.getControl(index).set(data2, 128);
        }
    }
}

function exit() {
}
