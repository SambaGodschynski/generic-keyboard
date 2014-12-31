
loadAPI(1);

host.defineController("Generic", "MIDI Keyboard", "1.0", "6E55D132-1846-4C64-9F97-48041F2D9B96");
host.defineMidiPorts(1, 0);

var LOWEST_CC = 1;
var HIGHEST_CC = 119;

function init() {
   host.getMidiInPort(0).setMidiCallback(onMidi);
   host.getMidiInPort(0).setSysexCallback(onSysex);
   generic = host.getMidiInPort(0).createNoteInput("", "??????");
   generic.setShouldConsumeEvents(false);

   transport = host.createTransport();

   // Make CCs 1-119 freely mappable
   userControls = host.createUserControls(HIGHEST_CC - LOWEST_CC + 1);

   for(var i=LOWEST_CC; i<=HIGHEST_CC; i++) {
      userControls.getControl(i - LOWEST_CC).setLabel("CC" + i);
   }
}

function onMidi(status, data1, data2) {
   if (isChannelController(status)) {
      if (data1 >= LOWEST_CC && data1 <= HIGHEST_CC) {
         var index = data1 - LOWEST_CC;
         userControls.getControl(index).set(data2, 128);
      }
   }
}

function onSysex(data) {
   // MMC Transport Controls:
   switch (data) {
      case "f07f7f0605f7":
         transport.rewind();
         break;
      case "f07f7f0604f7":
         transport.fastForward();
         break;
      case "f07f7f0601f7":
         transport.stop();
         break;
      case "f07f7f0602f7":
         transport.play();
         break;
      case "f07f7f0606f7":
         transport.record();
         break;
   }
}

function exit()
{
}
