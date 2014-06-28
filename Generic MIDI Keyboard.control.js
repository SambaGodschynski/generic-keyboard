
loadAPI(1);

var vendor = "Generic";
var model = "MIDI Keyboard";
var input = "MIDI Keyboard";

var vendorPref;
var modelPref;
var lowCcPref;
var highCcPref;

host.defineController(vendor, model, "1.0", "6E55D132-1846-4C64-9F97-48041F2D9B96", "Bitwig");
host.defineMidiPorts(1, 0);

var LOWEST_CC = 1;
var HIGHEST_CC = 119;

function init()
{
	 prefs = host.getPreferences();
	 vendorPref = prefs.getStringSetting("Vendor: ", "Settings", 50, "Generic");
	 vendorPref.addValueObserver(function(name){
			println(name);
			vendor = name;
	 });
	 modelPref = prefs.getStringSetting("Model: ", "Settings", 50, "MIDI Keyboard");
	 modelPref.addValueObserver(function(name){
			println(name);
			model = name;
			//host.restart;
	 });
	 lowCcPref = prefs.getNumberSetting("Lowest CC: ", "Settings", 1, 119, 1, "", 1);
	 lowCcPref.addValueObserver(128, function(value){
			println(value);
			LOWEST_CC = value;
	 });
	 highCcPref = prefs.getNumberSetting("Highest CC: ", "Settings", 1, 119, 1, "", 119);
	 highCcPref.addValueObserver(128, function(value){
			println(value);
			HIGHEST_CC = value;
	 });

   host.getMidiInPort(0).setMidiCallback(onMidi);
   generic = host.getMidiInPort(0).createNoteInput(model, "??????");
   generic.setShouldConsumeEvents(false);

   // Make CCs 1-119 freely mappable
   userControls = host.createUserControls(HIGHEST_CC - LOWEST_CC + 1);

   for(var i=LOWEST_CC; i<=HIGHEST_CC; i++)
   {
      userControls.getControl(i - LOWEST_CC).setLabel("CC" + i);
   }
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

function exit()
{
}
