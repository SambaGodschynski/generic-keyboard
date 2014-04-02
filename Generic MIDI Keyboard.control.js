
loadAPI(1);

host.defineController("Generic", "MIDI Keyboard", "1.0", "6E55D132-1846-4C64-9F97-48041F2D9B96");
host.defineMidiPorts(1, 0);

var LOWEST_CC = 2;
var HIGHEST_CC = 119;

function init()
{
   host.getMidiInPort(0).createNoteInput("MIDI Keyboard");
   host.getMidiInPort(0).setMidiCallback(onMidi);

   // Make CCs 2-119 freely mappable
   userControls = host.createUserControlsSection(HIGHEST_CC - LOWEST_CC + 1);

   for(var i=LOWEST_CC; i<=HIGHEST_CC; i++)
   {
      userControls.getControl(i - LOWEST_CC).setLabel("CC" + i);
   }
}

function exit()
{
}

function onMidi(status, data1, data2)
{
   if (isChannelController(status))
   {
      if (data1 >= LOWEST_CC && data1 <= HIGHEST_CC)
      {
         var index = data1 - LOWEST_CC;
         userControls.getControl(index).set(data2, 128);
      }
   }
}