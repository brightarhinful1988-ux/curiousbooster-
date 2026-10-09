const READER_LESSON_KEY = "curious.reader-lesson";
const COMPLETED_LESSONS_KEY = "curious.completed-lessons";
const readerCard = document.querySelector("#reader-card");
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const isPublicDemo = document.documentElement.dataset.publicDemo === "true";
let audioReadToken = 0;

function splitSpeechText(text, maxLength = 220) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks = [];
  let chunk = "";

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    for (const word of words) {
      if (chunk && `${chunk} ${word}`.length > maxLength) {
        chunks.push(chunk);
        chunk = "";
      }
      chunk = chunk ? `${chunk} ${word}` : word;
    }
    if (chunk && /[.!?]$/.test(sentence.trim())) {
      chunks.push(chunk);
      chunk = "";
    }
  }

  if (chunk) {
    chunks.push(chunk);
  }
  return chunks;
}

function getLessonSpeechText(pages) {
  const ignoredSelector = ".reader-audio, .eyebrow, .reader-page-number, .lesson-photo-credit, .time-tag, .subject-tag, .year-tag";
  return pages
    .flatMap((page) => [...page.querySelectorAll("h1, h2, h3, p, li, dt, dd, pre, figcaption")])
    .filter((element) => !element.closest(ignoredSelector))
    .map((element) => {
      const photoCaption = element.querySelector(".lesson-photo-caption");
      return (photoCaption || element).textContent.replace(/\s+/g, " ").trim();
    })
    .filter(Boolean)
    .join(". ");
}

function createAudioReader(pages) {
  const controls = document.createElement("section");
  controls.className = "reader-audio";
  controls.setAttribute("aria-label", "Lesson audio reader");
  const heading = document.createElement("h2");
  heading.textContent = "Listen to this lesson";
  const description = document.createElement("p");
  description.className = "reader-audio-description";
  description.textContent = "Use your device's speech voice to hear the lesson read aloud.";
  const actions = document.createElement("div");
  actions.className = "reader-audio-actions";
  const playButton = document.createElement("button");
  playButton.type = "button";
  playButton.className = "reader-audio-button reader-audio-play";
  playButton.textContent = "▶ Play lesson";
  const pauseButton = document.createElement("button");
  pauseButton.type = "button";
  pauseButton.className = "reader-audio-button";
  pauseButton.textContent = "Pause";
  pauseButton.disabled = true;
  const resumeButton = document.createElement("button");
  resumeButton.type = "button";
  resumeButton.className = "reader-audio-button";
  resumeButton.textContent = "Resume";
  resumeButton.disabled = true;
  const stopButton = document.createElement("button");
  stopButton.type = "button";
  stopButton.className = "reader-audio-button";
  stopButton.textContent = "Stop";
  stopButton.disabled = true;
  const status = document.createElement("p");
  status.className = "reader-audio-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.textContent = "";
  actions.append(playButton, pauseButton, resumeButton, stopButton);
  controls.append(heading, description, actions, status);

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    playButton.disabled = true;
    status.textContent = "Audio reading is not supported by this browser. Try a recent version of Chrome, Edge, or Safari.";
    return controls;
  }

  let chunks = [];
  let chunkIndex = 0;
  let isPaused = false;

  const setActiveButtons = (active) => {
    pauseButton.disabled = !active || isPaused;
    resumeButton.disabled = !active || !isPaused;
    stopButton.disabled = !active;
  };

  const speakNextChunk = (token) => {
    if (token !== audioReadToken) {
      return;
    }
    if (chunkIndex >= chunks.length) {
      setActiveButtons(false);
      playButton.disabled = false;
      status.textContent = "Finished reading the lesson.";
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
    utterance.onend = () => {
      if (token === audioReadToken) {
        chunkIndex += 1;
        speakNextChunk(token);
      }
    };
    utterance.onerror = (event) => {
      if (token !== audioReadToken || event.error === "canceled" || event.error === "interrupted") {
        return;
      }
      audioReadToken += 1;
      setActiveButtons(false);
      playButton.disabled = false;
      status.textContent = "Audio reading stopped because the browser could not continue. You can try again.";
      console.error("Lesson audio playback failed.", event.error);
    };
    window.speechSynthesis.speak(utterance);
  };

  playButton.addEventListener("click", () => {
    chunks = splitSpeechText(getLessonSpeechText(pages));
    if (chunks.length === 0) {
      status.textContent = "There is no lesson text available to read.";
      return;
    }
    audioReadToken += 1;
    const token = audioReadToken;
    chunkIndex = 0;
    isPaused = false;
    window.speechSynthesis.cancel();
    status.textContent = "Reading lesson aloud.";
    playButton.disabled = true;
    setActiveButtons(true);
    speakNextChunk(token);
  });

  pauseButton.addEventListener("click", () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      isPaused = true;
      setActiveButtons(true);
      status.textContent = "Lesson reading paused.";
    }
  });

  resumeButton.addEventListener("click", () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      isPaused = false;
      setActiveButtons(true);
      status.textContent = "Reading lesson aloud.";
    }
  });

  stopButton.addEventListener("click", () => {
    audioReadToken += 1;
    window.speechSynthesis.cancel();
    isPaused = false;
    setActiveButtons(false);
    playButton.disabled = false;
    status.textContent = "Lesson reading stopped.";
  });

  return controls;
}

const subjectPalettes = {
  BIOLOGY: ["#244e7a", "#f1bd55", "#8aafd3"],
  CHEMISTRY: ["#244e7a", "#f1bd55", "#8aafd3"],
  PHYSICS: ["#244e7a", "#f1bd55", "#8aafd3"],
  "EARTH SCIENCE": ["#244e7a", "#f1bd55", "#8aafd3"],
  "SPACE SCIENCE": ["#244e7a", "#f1bd55", "#8aafd3"],
  "ENVIRONMENTAL SCIENCE": ["#244e7a", "#f1bd55", "#8aafd3"],
  "COMPUTER SCIENCE": ["#244e7a", "#f1bd55", "#8aafd3"],
  PSYCHOLOGY: ["#244e7a", "#f1bd55", "#8aafd3"]
};

const lessonDiagramData = {
  "biology-cells": ["Cell membrane + nucleus", "Specialised cells", "Tissues and organs", "Organ systems"],
  "biology-classification": ["Observe shared features", "Group organisms", "Name with genus + species", "Compare biodiversity"],
  "biology-photosynthesis": ["Sunlight + water + carbon dioxide", "Chlorophyll captures light", "Glucose is produced", "Oxygen is released"],
  "biology-transport": ["Roots absorb water", "Xylem carries water upward", "Leaves lose water vapour", "Phloem moves sugars"],
  "biology-genetics": ["DNA contains genes", "Genes have different alleles", "Alleles pass from parents", "Offspring show variation"],
  "biology-nutrition": ["Food enters the mouth", "Digestion breaks food down", "Nutrients absorb in intestine", "Cells use nutrients"],
  "biology-respiration": ["Glucose + oxygen", "Cellular reactions", "Energy released for cells", "Carbon dioxide + water"],
  "biology-reproduction": ["Pollen reaches stigma", "Fertilisation joins nuclei", "Seeds develop", "New plants grow"],
  "biology-evolution": ["Inherited variation exists", "Environment selects traits", "Some survive and reproduce", "Trait frequency changes"],
  "biology-disease": ["Pathogen enters the body", "Immune system recognises it", "Defences respond", "Vaccination prepares memory"],
  "biology-ecology": ["Producers capture energy", "Food webs link organisms", "Habitats support populations", "Conservation protects systems"],
  "chemistry": ["Reactant particles", "Bonds rearrange", "Product particles", "Atoms are conserved"],
  "chemistry-atomic-structure": ["Protons + neutrons in nucleus", "Electrons around nucleus", "Proton number identifies element", "Neutron number varies in isotopes"],
  "chemistry-periodic-table": ["Elements ordered by proton number", "Rows show periods", "Columns show groups", "Patterns reveal properties"],
  "chemistry-bonding": ["Atoms transfer or share electrons", "Positive and negative charges form", "Electrostatic attraction acts", "Ionic or covalent bonds result"],
  "chemistry-moles": ["Balanced equation", "Coefficients give mole ratio", "Convert amount of substance", "Calculate required quantity"],
  "chemistry-gases": ["Gas particles move randomly", "Particles collide with walls", "Smaller volume means more collisions", "Pressure changes"],
  "chemistry-acids": ["Acid provides H+ ions", "Base neutralises acid", "Salt and water form", "Indicator shows pH change"],
  "chemistry-redox": ["One substance loses electrons", "Another gains electrons", "Oxidation and reduction pair", "Electron transfer balances"],
  "chemistry-rates-equilibrium": ["Particles collide", "More successful collisions speed reaction", "Forward and reverse reactions continue", "Equal rates give equilibrium"],
  "chemistry-energetics": ["Energy needed to break bonds", "New bonds form", "Energy is released", "Net change is exothermic or endothermic"],
  "chemistry-organic": ["Carbon forms covalent bonds", "Hydrocarbon chains form", "Single or double bonds differ", "Compounds make organic families"],
  "chemistry-electrolysis": ["Electricity passes through electrolyte", "Ions move to electrodes", "Electrons transfer at electrodes", "Products form"],
  "chemistry-analysis": ["Choose a chemical test", "Add reagent safely", "Observe colour or precipitate", "Use evidence to identify substance"],
  "physics-measurement": ["Choose physical quantity", "Select suitable instrument", "Read scale with units", "Record measured value"],
  "physics-motion": ["Forces act on an object", "Unbalanced force changes motion", "Acceleration depends on force and mass", "Motion can be predicted"],
  "physics-energy": ["Force moves an object", "Work transfers energy", "Energy changes form", "Power measures transfer rate"],
  "physics-thermal": ["Particles gain thermal energy", "Temperature describes average energy", "Heat transfers between regions", "Material warms or cools"],
  "physics-waves": ["Vibration starts a wave", "Wave carries energy", "Sound travels through a medium", "Frequency affects pitch"],
  "physics-optics": ["Light reaches a boundary", "Some light reflects", "Some light refracts", "Image or direction changes"],
  "physics-electricity": ["Cell provides potential difference", "Current flows in a circuit", "Resistance opposes current", "Components transfer electrical energy"],
  "physics-magnetism": ["Current creates a magnetic field", "Field acts around a conductor", "Coil strengthens the field", "Electromagnet can be switched"],
  "physics-induction": ["Magnet and coil move relatively", "Magnetic flux changes", "Induced voltage appears", "Current can be generated"],
  "physics-electronics": ["Semiconductor material", "Doping changes charge carriers", "Components control current", "Circuits process signals"],
  "physics-nuclear": ["Unstable nucleus", "Radioactive decay occurs", "Radiation is emitted", "Nucleus becomes more stable"],
  "earth-minerals": ["Mineral has a crystal structure", "Hardness tests scratching", "Streak shows powder colour", "Properties help identify mineral"],
  "earth-rock-cycle": ["Magma cools into igneous rock", "Weathering forms sediment", "Compaction makes sedimentary rock", "Heat and pressure make metamorphic rock"],
  "earth-soils": ["Rock weathers into particles", "Organic matter mixes in", "Soil stores air and water", "Plant cover reduces erosion"],
  "earth-plates": ["Lithospheric plates move", "Plates meet or separate", "Crust deforms or melts", "Earthquakes and mountains form"],
  "earth-weather": ["Sun heats water", "Evaporation adds vapour", "Cooling causes condensation", "Precipitation returns water"],
  "earth-groundwater": ["Rain infiltrates soil", "Water moves through permeable rock", "Aquifer stores groundwater", "Wells and springs supply water"],
  "earth-resources": ["Minerals occur in rock", "Survey identifies deposits", "Mining extracts resources", "Rehabilitation manages impacts"],
  "earth-hazards": ["Hazard threatens a place", "Exposure and vulnerability matter", "Warnings and planning prepare people", "Risk and harm can be reduced"],
  "earth-climate": ["Sun warms Earth's surface", "Greenhouse gases absorb heat", "Atmosphere and ocean circulate", "Climate patterns change"],
  "space-earth-moon": ["Sun illuminates the Moon", "Moon orbits Earth", "Positions change in space", "Eclipses occur in alignment"],
  "space-solar-system": ["Sun's gravity attracts planets", "Planets keep forward motion", "Gravity bends their paths", "Orbits repeat around the Sun"],
  "space-observations": ["Celestial object emits light", "Telescope gathers signals", "Instruments record observations", "Astronomers interpret evidence"],
  "space-stars": ["Gas and dust cloud collapses", "A protostar heats up", "Fusion begins in the core", "A star shines"],
  "space-sun": ["Sun's magnetic field changes", "Magnetic activity rises", "Flares and spots appear", "Solar activity affects space"],
  "space-spectra": ["Star emits light", "Light separates into wavelengths", "Spectral lines appear", "Lines reveal chemical elements"],
  "space-solar-system-bodies": ["Small rocky or icy body", "Orbit carries it around the Sun", "Comet may form a tail", "Asteroids and comets differ"],
  "space-galaxies": ["Stars gather by gravity", "Galaxies contain gas and dust", "Galaxies move through space", "Distant galaxies show expansion"],
  "space-cosmology": ["Observe distant galaxies", "Measure light and redshift", "Compare evidence over time", "Infer an expanding universe"],
  "environment-ecosystems": ["Organisms share a habitat", "Living and non-living factors interact", "Populations form communities", "Biodiversity supports ecosystem"],
  "environment-habitats": ["Habitat offers resources", "Organisms occupy niches", "Populations interact", "Community changes over time"],
  "environment-food-webs": ["Plants capture solar energy", "Herbivores eat producers", "Predators eat other consumers", "Decomposers return nutrients"],
  "environment-pollution": ["Pollutant enters environment", "Air water or soil carries it", "Organisms are exposed", "Effects can be monitored and reduced"],
  "environment-waste": ["Products are used", "Materials are sorted", "Reuse and recycling recover value", "Less waste reaches landfill"],
  "environment-water-quality": ["Rain enters catchment", "Water carries dissolved materials", "Testing checks water quality", "Protection reduces contamination"],
  "environment-sustainability": ["Resource is used", "Ecosystem renews at a rate", "Communities plan together", "Future needs are protected"],
  "environment-ghana-ecosystems": ["Forest supports many species", "Wetland filters and stores water", "Coastline provides nursery habitat", "Connected habitats support biodiversity"],
  "environment-climate": ["Greenhouse gases trap heat", "Rainfall and temperature patterns shift", "Communities experience local impacts", "Adaptation reduces vulnerability"],
  "environment-conservation": ["Survey records species and habitat", "Assessment identifies pressures", "Community plans actions", "Monitoring checks outcomes"],
  "computing-algorithms": ["Define the problem", "Break it into steps", "Follow the algorithm", "Check the output"],
  "computing-hardware": ["Input devices collect data", "Processor follows instructions", "Memory stores information", "Output presents results"],
  "computing-data": ["Information is represented in bits", "Bits group into binary numbers", "Binary encodes text or images", "Computer stores and processes data"],
  "computing-python-strings": ["Text is stored as a string", "Characters have positions", "Operations join or inspect text", "Program displays a result"],
  "computing-python-variables": ["Assign a value", "Store it in a variable", "Use the variable in a command", "Output shows the result"],
  "computing-python-calculations": ["Program asks for input", "Convert input to a number", "Calculate a result", "Print the answer"],
  "computing-programming": ["Represent data", "Use logic and instructions", "Program processes input", "Output solves a task"],
  "computing-databases": ["Records store related facts", "Fields label each value", "Keys identify records", "Queries retrieve information"],
  "computing-python-conditionals": ["Program tests a condition", "True follows one branch", "False follows another branch", "Chosen action produces output"],
  "computing-python-loops": ["Choose a sequence or range", "Loop visits each value", "Indented instructions repeat", "Loop stops at its boundary"],
  "computing-python-debugging": ["Describe expected result", "Run a test case", "Find where output differs", "Correct and test again"],
  "computing-python-functions": ["Define a named function", "Pass values as parameters", "Function performs a task", "Return a result for reuse"],
  "computing-python-lists": ["Create an ordered list", "Items have indexes", "Loop visits each item", "Program processes the collection"],
  "computing-web": ["HTML structures a page", "CSS styles the content", "JavaScript adds interaction", "Browser displays the website"],
  "computing-python-dictionaries": ["Create key-value pairs", "Choose a descriptive key", "Look up its matching value", "Use the record in a program"],
  "computing-networks": ["Devices connect to a network", "Data travels between systems", "Security checks protect access", "Users share information safely"],
  "psychology-research": ["Ask a testable question", "Choose a measure and method", "Collect participant data ethically", "Interpret evidence cautiously"],
  "psychology-biology": ["Neurons receive signals", "Nervous system processes input", "Brain coordinates a response", "Behaviour reflects interacting influences"],
  "psychology-development": ["Biological changes occur", "Thinking and skills develop", "Relationships and culture influence growth", "Change continues across lifespan"],
  "psychology-learning": ["Pay attention to information", "Encode and store memory", "Retrieve through practice", "Recall strengthens learning"],
  "psychology-conditioning": ["A cue predicts an event", "Association is learned", "Actions have consequences", "Behaviour changes with experience"],
  "psychology-perception": ["Sense organs detect stimuli", "Signals reach the brain", "Attention selects information", "Perception guides interpretation"],
  "psychology-stress": ["Demand is appraised", "Body and emotions respond", "Coping strategies are used", "Support can improve wellbeing"],
  "psychology-social": ["People observe a group", "Social influence shapes choices", "Context affects behaviour", "Evidence helps explain differences"],
  "psychology-personality": ["People show individual differences", "Traits describe patterns", "Biology and experience interact", "Behaviour varies by context"],
  "psychology-mental-health": ["Wellbeing changes over time", "Stressors can affect mental health", "Support and care are available", "Help-seeking can aid recovery"]
};

const lessonPictureStyles = {
  "biology-cells": "cell",
  "biology-classification": "taxonomy",
  "biology-photosynthesis": "photosynthesis",
  "biology-transport": "transport",
  "biology-genetics": "dna",
  "biology-nutrition": "digestion",
  "biology-respiration": "mitochondria",
  "biology-reproduction": "flower",
  "biology-evolution": "evolution",
  "biology-disease": "immune",
  "biology-ecology": "foodweb",
  chemistry: "reaction",
  "chemistry-atomic-structure": "atom",
  "chemistry-periodic-table": "periodic",
  "chemistry-bonding": "molecule",
  "chemistry-moles": "stoichiometry",
  "chemistry-gases": "gas",
  "chemistry-acids": "acid-base",
  "chemistry-redox": "electron",
  "chemistry-rates-equilibrium": "collision",
  "chemistry-energetics": "calorimetry",
  "chemistry-organic": "organic",
  "chemistry-electrolysis": "electrolysis",
  "chemistry-analysis": "test-tubes",
  "physics-measurement": "instrument",
  "physics-motion": "motion",
  "physics-energy": "energy",
  "physics-thermal": "thermal",
  "physics-waves": "wave",
  "physics-optics": "light",
  "physics-electricity": "circuit",
  "physics-magnetism": "magnet",
  "physics-induction": "induction",
  "physics-electronics": "semiconductor",
  "physics-nuclear": "nucleus",
  "earth-minerals": "crystal",
  "earth-rock-cycle": "rock",
  "earth-soils": "soil",
  "earth-plates": "tectonic",
  "earth-weather": "weather-cycle",
  "earth-groundwater": "aquifer",
  "earth-resources": "mine",
  "earth-hazards": "landslide",
  "earth-climate": "climate",
  "space-earth-moon": "eclipse",
  "space-solar-system": "orbit",
  "space-observations": "telescope",
  "space-stars": "nebula",
  "space-sun": "sun",
  "space-spectra": "spectrum",
  "space-solar-system-bodies": "comet",
  "space-galaxies": "galaxy",
  "space-cosmology": "cosmos",
  "environment-ecosystems": "ecosystem",
  "environment-habitats": "habitat",
  "environment-food-webs": "environment-foodweb",
  "environment-pollution": "pollution",
  "environment-waste": "recycling",
  "environment-water-quality": "water-quality",
  "environment-sustainability": "sustainability",
  "environment-ghana-ecosystems": "ghana-habitats",
  "environment-climate": "environment-climate",
  "environment-conservation": "conservation",
  "computing-algorithms": "algorithm",
  "computing-hardware": "computer",
  "computing-data": "binary",
  "computing-python-strings": "string",
  "computing-python-variables": "variables",
  "computing-python-calculations": "calculator",
  "computing-programming": "code",
  "computing-databases": "database",
  "computing-python-conditionals": "conditional",
  "computing-python-loops": "loop",
  "computing-python-debugging": "debugger",
  "computing-python-functions": "function",
  "computing-python-lists": "list",
  "computing-web": "web",
  "computing-python-dictionaries": "dictionary",
  "computing-networks": "network",
  "psychology-research": "research",
  "psychology-biology": "brain",
  "psychology-development": "development",
  "psychology-learning": "memory",
  "psychology-conditioning": "conditioning",
  "psychology-perception": "senses",
  "psychology-stress": "wellbeing",
  "psychology-social": "social",
  "psychology-personality": "personality",
  "psychology-mental-health": "mental-health"
};

const subjectStudyGuides = {
  BIOLOGY: {
    lens: "Biologists study life at linked levels, from molecules and cells to organisms, populations, and ecosystems. First decide which level this lesson concerns. Then trace how the structures or organisms in that level affect one another. Many biology explanations describe a sequence: a structure enables a process, the process changes or moves something, and that change supports survival, growth, or reproduction. Use the lesson's examples to connect those steps rather than learning each sentence as an isolated fact.",
    method: "In a biology investigation, state what you will observe before collecting evidence. Keep the observation separate from your explanation: a measured change is evidence, while the reason for that change is an interpretation. If comparing groups, identify what differs and what should stay the same. Repeat observations where possible, record the conditions, and consider whether another factor could explain the result. Use diagrams to label structures clearly and arrows to show the direction of a process; do not add a feature that was not observed or taught.",
    context: "Biology connects directly to food production, health, and conservation in Ghana. A school garden can be used to observe plant growth; a safe school-ground survey can compare habitats and organisms; and public-health examples can show how organisms interact with people. In every case, a single observation has limits: season, water, light, sampling effort, and many other conditions may affect what is seen. Treat local examples as evidence to investigate, not as proof that one result applies everywhere.",
    practice: "Make a labelled sketch or a short sequence diagram for the lesson. Include the starting condition, the structure or organism involved, and the outcome. Write one sentence explaining how the evidence supports your idea and one question that the evidence cannot answer yet. Use only teacher-approved specimens and activities; observe unfamiliar organisms without touching or collecting them."
  },
  CHEMISTRY: {
    lens: "Chemistry explains materials by looking at the particles they contain and how those particles are arranged or changed. When studying a topic, identify the substances before and after the process, then ask whether particles have merely been rearranged or whether a physical state or mixture has changed. Atoms are conserved in ordinary chemical reactions, even when bonds change and new substances form. Models and equations are ways of keeping track of that evidence; they are not the reaction itself.",
    method: "A reliable chemistry solution begins with the question: list the known information, identify the quantity or change being asked about, and choose a suitable representation such as a word equation, symbol equation, particle sketch, or calculation. Check that formulae and units are used consistently. In an experiment, change one planned factor at a time, record observations before interpreting them, and repeat measurements if the method allows. Distinguish evidence such as a colour change or gas formation from a conclusion about which substances are present.",
    context: "Chemistry is used in water treatment, food preparation, agriculture, construction materials, medicines, and energy technologies in Ghana. These examples help show why knowing a material's properties and reactions matters, but a classroom model cannot replace professional testing or safety advice. The same substance may be useful in one controlled setting and harmful in another concentration or form. Always connect an application to the property or reaction that makes it useful.",
    practice: "Create a before-and-after particle or materials table for the lesson. Name what is known, show the change, and write the evidence that would help distinguish a physical change from a chemical reaction where relevant. Check any equation or calculation against the question and explain each step. In practical work, follow the teacher's procedure, wear the required protective equipment, and never mix unknown substances."
  },
  PHYSICS: {
    lens: "Physics uses models and measurements to describe matter, energy, forces, motion, waves, and interactions. Begin by naming the physical quantities involved and how they are measured. A diagram can show the system; a table can organise measurements; and a graph can reveal a pattern. Equations express relationships between quantities, so check what each symbol means and whether the units are compatible before substituting values.",
    method: "For a numerical question, write down the known values with units, identify the unknown, choose the relationship that connects them, and rearrange it before substituting. Keep units through the calculation and ask whether the answer is a sensible size. In an investigation, make repeated readings where practical, use an appropriate scale, and note possible measurement limitations. A graph should have labelled axes and units; a trend supports a model but does not by itself prove every cause.",
    context: "Physics helps explain everyday experiences in Ghana, from sound and lighting to transport, electricity, building design, and solar technologies. Apply a lesson by identifying the system and the energy or force transfers involved rather than relying on a familiar phrase alone. Real devices have limits and safety requirements; school calculations simplify conditions, so do not treat them as instructions for repairing electrical equipment or handling machinery.",
    practice: "Draw the physical situation and label the quantities given in the question. Predict the direction or general size of the result before calculating, then compare the prediction with your answer. For a practical task, decide what you will measure, what you will change, and what conditions must remain similar. Record data clearly and explain one limitation that could affect the conclusion."
  },
  "EARTH SCIENCE": {
    lens: "Earth science explains a changing planet through processes that operate at very different scales and times. A landscape, rock, soil, or water system is evidence of processes acting over time; a single feature rarely tells the whole story. Separate what can be directly observed from an explanation of how it formed. Maps, cross-sections, measurements, and comparisons between locations help organise evidence and reveal patterns.",
    method: "When interpreting an Earth science example, identify the material or feature, describe its observable properties, and connect those properties to a process only when the evidence supports it. Consider the timescale: some changes are rapid, while others take many years or longer. For maps or data, check the key, units, location, and date. When discussing a hazard, distinguish the physical event from exposure and vulnerability; planning and preparation can reduce risk even when the event itself cannot be prevented.",
    context: "Ghana's varied landscapes provide settings for learning about soils, rivers, weather, rocks, and resources. Local observations can support questions about erosion, drainage, land use, or water quality, but conditions differ by location and season. Resource use also involves communities and environmental effects. A good explanation identifies both the Earth process and the decisions people can make to reduce damage or use resources responsibly.",
    practice: "Use a labelled cross-section or process sequence for the lesson. Mark the evidence first, then add arrows or labels to show the explanation you are testing. Compare two locations or two sets of observations and state one similarity and one difference. For fieldwork, stay with the class, follow site rules, avoid unstable ground and water, and do not collect rocks or materials unless your teacher permits it."
  },
  "SPACE SCIENCE": {
    lens: "Space science investigates objects and events that are often too distant or large to examine directly. Scientists rely on observations of light and other signals, measurements, mathematical models, and repeated observations over time. A model simplifies a system so that a question can be tested; it is useful when its assumptions and limits are understood. Keep scale in mind: diagrams of orbits or planetary distances are usually not drawn to scale.",
    method: "To interpret an astronomy explanation, identify the bodies involved, their relative positions or motions, and the observation that supports the explanation. Distinguish an object's own light from reflected light, and distinguish apparent motion across the sky from motion in a model of the solar system. For data, note when and how the observation was made. More than one observation may be needed to separate competing explanations.",
    context: "Observing the night sky can connect classroom ideas to seasons, the Moon's changing appearance, and visible planets or stars. The view depends on time, weather, location, and light pollution, so record these conditions when comparing observations. A model or simulation can make a large-scale system easier to study, but it should not be confused with the real distances or sizes. Never look directly at the Sun through the unaided eye, binoculars, or a telescope.",
    practice: "Sketch the positions of the objects in the lesson and label which body is observed from which viewpoint. Write what an observer would see and what the model says is happening. Then name one observation that could help check the model. For a safe sky journal, record date, time, direction, weather, and the visible pattern without using unapproved equipment."
  },
  "ENVIRONMENTAL SCIENCE": {
    lens: "Environmental science studies connected systems: organisms, water, air, soil, energy, and human activity influence one another. When one part changes, effects can travel through the system and may appear later or in another place. Identify the parts of the system, the links between them, and the scale of the question. A simple cause-and-effect diagram helps distinguish a direct effect from a chain of indirect effects.",
    method: "A useful environmental investigation asks a focused question, chooses observations that can answer it, and records where and when measurements were made. Compare like with like and consider other possible influences, such as rainfall, season, land use, or sampling effort. A correlation between two changes is a reason to investigate further, not automatic proof that one caused the other. Explain both benefits and trade-offs when comparing possible actions.",
    context: "Environmental questions in Ghana can involve waste, water quality, farming, energy use, forests, wetlands, and coastal communities. Local solutions work best when they fit the place and include the people affected. An observation at one site may identify a concern, but careful repeated measurements and reliable guidance are needed before making a broad claim. Conservation also involves livelihoods, health, fairness, and long-term stewardship.",
    practice: "Draw a small system map for the topic. Use arrows to show at least three connections and label whether each arrow represents a flow, an effect, or a decision. Propose one practical action, name who would need to take part, and state one possible unintended effect to monitor. Use school-approved observations and never sample or handle polluted material."
  },
  "COMPUTER SCIENCE": {
    lens: "Computer science is about representing information and designing precise processes that solve problems. A useful way to start is to identify the input, the processing steps, and the output. Break a larger task into smaller parts, state what each part should do, and decide how success will be checked. A program is one implementation of an algorithm; explaining the algorithm clearly helps whether or not code is used.",
    method: "Trace a program one step at a time. Record variable values as they change, check each condition, and follow the order of instructions, including indentation and loop boundaries. Test typical input, boundary cases, and unexpected input. If output is wrong, isolate the smallest part that fails and compare actual behaviour with expected behaviour. Keep data private, use trusted devices and accounts, and ask permission before testing systems or sharing information.",
    context: "Computing skills can support school projects and services in Ghana, from organising survey results to building accessible websites or automating a repeated calculation. Good solutions are not only correct: they should be understandable, usable, and respectful of privacy. Consider who may be excluded by a design, what personal information is truly needed, and how the system behaves when input is incomplete or invalid.",
    practice: "Describe a small version of the lesson's problem in plain language. Write its inputs, steps, and expected output, then test the steps manually with at least two different examples. If the lesson includes code, explain what each line contributes and change one input to predict the result. Do not run unfamiliar code on personal or shared systems without teacher approval."
  },
  PSYCHOLOGY: {
    lens: "Psychology uses evidence to study behaviour and mental processes. A clear question should specify what is being studied and how it could be observed or measured. People differ, and behaviour can be influenced by context, development, biology, culture, and experience. An explanation should therefore be supported by evidence and should avoid assuming that one person's experience represents everyone.",
    method: "When considering a psychological study, identify the question, participants, procedure, and the way key ideas were measured. Ask whether the method can answer the question and whether other factors could influence the result. A relationship between two variables does not alone show that one caused the other. Ethical practice includes informed agreement where appropriate, privacy, minimising harm, and the right to stop; classroom learning must not become an unsupervised experiment on classmates.",
    context: "Psychology can help people think carefully about learning, wellbeing, relationships, and decision-making in Ghana's varied communities. Culture and circumstances matter, so an idea or finding should not be applied to everyone without evidence. Classroom examples are for learning, not diagnosis or treatment. For a serious concern, speak with a trusted adult or qualified health professional rather than relying on a lesson or quiz.",
    practice: "Turn the lesson topic into a question that could be studied respectfully. Define what would count as evidence, identify one factor that should be considered, and explain how participants' privacy and wellbeing would be protected. Then state what conclusion the evidence would support and what it could not prove. Use hypothetical examples unless a teacher has approved and supervised an activity."
  }
};

function addTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  parent.append(element);
  return element;
}

function addSvgElement(parent, tagName, attributes = {}) {
  const element = document.createElementNS(SVG_NAMESPACE, tagName);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  parent.append(element);
  return element;
}

function wrapSvgText(text, maxCharacters, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxCharacters && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) {
    lines.push(line);
  }
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, maxCharacters - 1)}…`;
  }
  return lines;
}

function getPagePalette(subject, pageIndex, lessonId = "") {
  const colors = subjectPalettes[subject.toUpperCase()] || subjectPalettes.BIOLOGY;
  const lessonOffset = [...lessonId].reduce((total, character) => total + character.charCodeAt(0), 0);
  return colors.map((_, index) => colors[(index + pageIndex + lessonOffset) % colors.length]);
}

function createTopicFigure(lesson, subject, pageIndex, view) {
  const palette = getPagePalette(subject, pageIndex + 1, lesson.id);
  const stages = lessonDiagramData[lesson.id] || [
    lesson.title,
    lesson.intro,
    lesson.fact,
    lesson.explanation
  ];
  const figure = document.createElement("figure");
  figure.className = `reading-figure lesson-topic-figure topic-figure-${view}`;
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("viewBox", "0 0 760 310");
  svg.setAttribute("role", "img");
  const titleId = `topic-visual-title-${lesson.id}-${pageIndex}-${view}`;
  const descriptionId = `topic-visual-description-${lesson.id}-${pageIndex}-${view}`;
  svg.setAttribute("aria-labelledby", `${titleId} ${descriptionId}`);
  const title = addSvgElement(svg, "title", { id: titleId });
  title.textContent = `${lesson.title}: topic diagram`;
  const description = addSvgElement(svg, "desc", { id: descriptionId });
  description.textContent = `${lesson.title}. ${stages.join(" then ")}.`;
  const background = view === 1 ? "#f1f7ff" : "#fff8e9";
  addSvgElement(svg, "rect", { x: "0", y: "0", width: "760", height: "310", rx: "20", fill: background });
  addSvgElement(svg, "circle", { cx: "26", cy: "34", r: "56", fill: palette[2], opacity: "0.25" });
  addSvgElement(svg, "circle", { cx: "738", cy: "286", r: "64", fill: palette[1], opacity: "0.24" });
  const definitions = addSvgElement(svg, "defs");
  const marker = addSvgElement(definitions, "marker", {
    id: `topic-arrow-${lesson.id}-${pageIndex}-${view}`,
    markerWidth: "9",
    markerHeight: "9",
    refX: "7",
    refY: "4.5",
    orient: "auto",
    markerUnits: "strokeWidth"
  });
  addSvgElement(marker, "path", { d: "M0,0 L9,4.5 L0,9 z", fill: palette[0] });

  const heading = addSvgElement(svg, "text", {
    x: "380",
    y: "40",
    fill: palette[0],
    "font-family": "Arial, sans-serif",
    "font-size": "17",
    "font-weight": "700",
    "text-anchor": "middle"
  });
  heading.textContent = lesson.title.toUpperCase();

  const positions = view === 1
    ? [{ x: 100, y: 86 }, { x: 455, y: 86 }, { x: 455, y: 194 }, { x: 100, y: 194 }]
    : [{ x: 38, y: 121 }, { x: 220, y: 121 }, { x: 402, y: 121 }, { x: 584, y: 121 }];

  const edges = view === 1
    ? [[0, 1], [1, 2], [2, 3]]
    : [[0, 1], [1, 2], [2, 3]];

  for (const [fromIndex, toIndex] of edges) {
    const from = positions[fromIndex];
    const to = positions[toIndex];
    let startX = from.x + 72;
    let startY = from.y + 31;
    let endX = to.x + 72;
    let endY = to.y + 31;
    if (Math.abs(to.x - from.x) >= Math.abs(to.y - from.y)) {
      startX += to.x > from.x ? 72 : -72;
      endX += to.x > from.x ? -78 : 78;
    } else {
      startY += to.y > from.y ? 31 : -31;
      endY += to.y > from.y ? -36 : 36;
    }
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    addSvgElement(svg, "path", {
      d: `M${startX} ${startY} Q${midX} ${midY} ${endX} ${endY}`,
      fill: "none",
      stroke: palette[fromIndex % palette.length],
      "stroke-width": "7",
      "stroke-linecap": "round",
      "marker-end": `url(#topic-arrow-${lesson.id}-${pageIndex}-${view})`
    });
  }

  positions.forEach((position, index) => {
    const color = palette[index];
    addSvgElement(svg, "rect", {
      x: String(position.x),
      y: String(position.y),
      width: "144",
      height: "62",
      rx: view === 1 ? "31" : "12",
      fill: color,
      stroke: "#ffffff",
      "stroke-width": "3"
    });
    const number = addSvgElement(svg, "text", {
      x: String(position.x + 72),
      y: String(position.y + 20),
      fill: "#ffffff",
      "font-family": "Arial, sans-serif",
      "font-size": "11",
      "font-weight": "700",
      "text-anchor": "middle",
      "letter-spacing": "1"
    });
    number.textContent = `STEP ${index + 1}`;
    const label = addSvgElement(svg, "text", {
      x: String(position.x + 72),
      y: String(position.y + 43),
      fill: "#ffffff",
      "font-family": "Arial, sans-serif",
      "font-size": "12",
      "font-weight": "700",
      "text-anchor": "middle"
    });
    const lines = wrapSvgText(stages[index], 17, 2);
    label.textContent = "";
    for (const [lineIndex, line] of lines.entries()) {
      const tspan = addSvgElement(label, "tspan", {
        x: String(position.x + 72),
        dy: lineIndex === 0 ? "0" : "13"
      });
      tspan.textContent = line;
      if (lineIndex < lines.length - 1) {
        tspan.append(document.createTextNode(" "));
      }
    }
  });

  const caption = document.createElement("figcaption");
  caption.textContent = `${lesson.title}: ${stages.join(" → ")}.`;
  figure.append(svg, caption);
  return figure;
}

function createLessonPicture(lesson, subject, pageIndex) {
  const scene = lessonPictureStyles[lesson.id] || "ecosystem";
  const lessonStages = lessonDiagramData[lesson.id] || [
    lesson.title,
    lesson.intro,
    lesson.fact,
    lesson.explanation
  ];
  const focusIndex = [0, 1, 3][pageIndex];
  const focus = lessonStages[focusIndex];
  const figure = document.createElement("figure");
  figure.className = `reading-figure lesson-picture picture-${scene}`;
  if (lesson.id !== "chemistry-periodic-table") {
    const photo = window.lessonPhotoAttributions?.[lesson.id];
    if (!photo) {
      throw new Error(`No credited lesson photo is configured for ${lesson.id}.`);
    }
    figure.classList.add("lesson-photo");
    const image = document.createElement("img");
    image.src = photo.path;
    image.alt = `${lesson.title}: ${photo.title}`;
    image.loading = "lazy";
    image.decoding = "async";
    const caption = document.createElement("figcaption");
    const topicCaption = document.createElement("span");
    topicCaption.className = "lesson-photo-caption";
    topicCaption.textContent = `${lesson.title} — ${focus}.`;
    const attribution = document.createElement("span");
    attribution.className = "lesson-photo-credit";
    attribution.append("Photo: ");
    const source = document.createElement("a");
    source.href = photo.sourceUrl;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent = photo.title;
    attribution.append(source, ` by ${photo.artist} — `);
    const license = document.createElement("a");
    license.href = photo.licenseUrl;
    license.target = "_blank";
    license.rel = "noopener noreferrer";
    license.textContent = photo.license;
    attribution.append(license, " (Wikimedia Commons).");
    caption.append(topicCaption, attribution);
    figure.append(image, caption);
    return figure;
  }
  const palette = getPagePalette(subject, pageIndex + 2, lesson.id);
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("viewBox", "0 0 760 360");
  svg.setAttribute("role", "img");
  const titleId = `lesson-picture-title-${lesson.id}-${pageIndex}`;
  const descriptionId = `lesson-picture-description-${lesson.id}-${pageIndex}`;
  svg.setAttribute("aria-labelledby", `${titleId} ${descriptionId}`);
  const title = addSvgElement(svg, "title", { id: titleId });
  title.textContent = `${lesson.title}: ${focus}`;
  const description = addSvgElement(svg, "desc", { id: descriptionId });
  description.textContent = `${pictureDescriptions[scene]} This ${subject.toLowerCase()} illustration focuses on ${focus.toLowerCase()}.`;
  const defs = addSvgElement(svg, "defs");
  const gradient = addSvgElement(defs, "linearGradient", {
    id: `lesson-picture-sky-${lesson.id}-${pageIndex}`,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  });
  addSvgElement(gradient, "stop", { offset: "0%", "stop-color": pageIndex === 1 ? "#d8e8ff" : "#c7f0ed" });
  addSvgElement(gradient, "stop", { offset: "100%", "stop-color": pageIndex === 2 ? "#ffe7bd" : "#f5f4ff" });
  const arrowMarker = addSvgElement(defs, "marker", {
    id: `lesson-picture-arrow-${lesson.id}-${pageIndex}`,
    markerWidth: "9",
    markerHeight: "9",
    refX: "7",
    refY: "4.5",
    orient: "auto"
  });
  addSvgElement(arrowMarker, "path", { d: "M0,0 L9,4.5 L0,9 z", fill: palette[0] });
  addSvgElement(svg, "rect", { width: "760", height: "360", rx: "22", fill: `url(#lesson-picture-sky-${lesson.id}-${pageIndex})` });
  if (scene !== "periodic") {
    addSvgElement(svg, "circle", {
      cx: pageIndex === 1 ? "655" : "110",
      cy: "73",
      r: "34",
      fill: palette[2],
      opacity: "0.95"
    });
  }

  const path = (d, fill, extra = {}) =>
    addSvgElement(svg, "path", { d, fill, ...extra });
  const circle = (cx, cy, r, fill, extra = {}) =>
    addSvgElement(svg, "circle", { cx: String(cx), cy: String(cy), r: String(r), fill, ...extra });
  const rect = (x, y, width, height, fill, extra = {}) =>
    addSvgElement(svg, "rect", {
      x: String(x),
      y: String(y),
      width: String(width),
      height: String(height),
      fill,
      ...extra
    });
  const line = (x1, y1, x2, y2, stroke, width = 6, extra = {}) =>
    addSvgElement(svg, "path", {
      d: `M${x1} ${y1}L${x2} ${y2}`,
      fill: "none",
      stroke,
      "stroke-width": String(width),
      "stroke-linecap": "round",
      ...extra
    });
  const ellipse = (cx, cy, rx, ry, fill, extra = {}) =>
    addSvgElement(svg, "ellipse", {
      cx: String(cx),
      cy: String(cy),
      rx: String(rx),
      ry: String(ry),
      fill,
      ...extra
    });

  switch (scene) {
    case "cell":
      ellipse(380, 185, 214, 126, "#a6e4ce", { stroke: palette[0], "stroke-width": "10" });
      ellipse(386, 183, 185, 99, "#d8f7e9", { stroke: "#ffffff", "stroke-width": "5" });
      circle(353, 178, 43, "#8c75d1");
      circle(353, 178, 20, "#c9b9ff");
      ellipse(477, 155, 28, 13, "#f3a45f");
      ellipse(295, 220, 25, 12, "#f3a45f");
      ellipse(442, 222, 20, 10, "#ed7184");
      for (const [x, y] of [[248, 165], [285, 135], [421, 133], [497, 200], [322, 246]]) {
        circle(x, y, 7, palette[2]);
      }
      break;
    case "dna":
      for (let y = 73; y <= 287; y += 22) {
        const wave = Math.sin(y / 26) * 68;
        const left = 380 + wave;
        const right = 380 - wave;
        line(left, y, right, y, y % 44 === 7 ? palette[1] : palette[2], 5);
        circle(left, y, 8, palette[0]);
        circle(right, y, 8, "#e46c92");
      }
      path("M380 65 C520 105 240 145 380 185 C520 225 240 265 380 300", "none", {
        stroke: palette[0], "stroke-width": "12", "stroke-linecap": "round"
      });
      path("M380 65 C240 105 520 145 380 185 C240 225 520 265 380 300", "none", {
        stroke: "#e46c92", "stroke-width": "12", "stroke-linecap": "round"
      });
      break;
    case "plant":
      path("M0 251Q120 214 225 252T460 243T760 235V360H0Z", "#83c878");
      path("M0 293Q180 257 358 302T760 277V360H0Z", "#8d613e");
      line(380, 282, 380, 126, "#43854c", 13);
      for (const [x, y, flip] of [[337, 166, false], [422, 144, true], [322, 213, true], [433, 199, false]]) {
        path(flip
          ? `M380 ${y + 22}Q${x} ${y - 20} ${x} ${y}Q${x + 32} ${y + 20} 380 ${y + 22}Z`
          : `M380 ${y + 22}Q${x + 32} ${y - 20} ${x} ${y}Q${x - 20} ${y + 20} 380 ${y + 22}Z`,
        palette[0]);
      }
      line(380, 274, 346, 322, "#e5d1ac", 5);
      line(380, 274, 417, 322, "#e5d1ac", 5);
      line(380, 274, 380, 333, "#e5d1ac", 5);
      if (lesson.id === "biology-photosynthesis") {
        circle(614, 96, 34, "#ffc949");
        for (let ray = 0; ray < 8; ray += 1) {
          const angle = (ray * Math.PI) / 4;
          line(614 + Math.cos(angle) * 47, 96 + Math.sin(angle) * 47, 614 + Math.cos(angle) * 61, 96 + Math.sin(angle) * 61, "#f0a33d", 5);
        }
      }
      break;
    case "body":
      path("M314 96Q285 112 282 154L303 206L325 174L331 310H429L435 174L457 206L478 154Q475 112 446 96L414 86H346Z", "#f6bfaa");
      ellipse(380, 126, 29, 37, "#f0a78c");
      if (lesson.id === "biology-respiration" || lesson.id === "psychology-biology") {
        ellipse(351, 190, 26, 49, "#ee7693");
        ellipse(409, 190, 26, 49, "#ee7693");
        path("M380 138V171M380 171L352 187M380 171L408 187", "none", { stroke: "#8b5abc", "stroke-width": "8", "stroke-linecap": "round" });
      } else {
        path("M380 150Q350 137 349 177Q351 203 380 215Q409 203 411 177Q410 137 380 150Z", "#d94c69");
        line(380, 157, 380, 204, "#ffe5b5", 4);
      }
      line(340, 220, 320, 283, "#e67865", 7);
      line(420, 220, 440, 283, "#e67865", 7);
      break;
    case "ecosystem":
      path("M0 223Q127 166 265 222T512 205T760 201V360H0Z", "#78bb75");
      path("M0 264Q164 227 340 265T760 239V360H0Z", "#349d87");
      path("M0 305Q115 280 210 304T420 300T760 287V360H0Z", "#f0c979");
      for (const [x, y, r] of [[145, 179, 39], [565, 173, 49], [658, 211, 31]]) {
        rect(x - 7, y, 14, 83, "#81583d", { rx: "6" });
        circle(x, y - 17, r, x === 145 ? "#287b5b" : "#458d57");
        circle(x - 13, y - 28, r * 0.53, "#73b86c", { opacity: "0.9" });
      }
      ellipse(392, 268, 48, 20, "#e29a53");
      circle(425, 254, 12, "#e29a53");
      line(366, 278, 357, 296, "#5d4738", 5);
      line(402, 278, 410, 296, "#5d4738", 5);
      break;
    case "reaction":
      rect(0, 248, 760, 112, "#e6ad77");
      rect(0, 245, 760, 12, "#a95e5c");
      path("M254 111H367L356 252H266Z", "#ffffff", { opacity: "0.72", stroke: palette[0], "stroke-width": "7" });
      path("M266 201Q310 184 357 202L354 249H270Z", "#e87c9c");
      path("M414 135H520L510 252H425Z", "#ffffff", { opacity: "0.75", stroke: "#367fac", "stroke-width": "7" });
      path("M423 202Q469 188 514 203L510 249H428Z", "#66c8db");
      circle(300, 173, 8, "#ffffff");
      circle(329, 151, 6, "#ffffff");
      circle(455, 178, 7, "#ffffff");
      rect(175, 232, 398, 18, "#8d5e52", { rx: "8" });
      break;
    case "periodic": {
      const elements = [
        "H He",
        "Li Be B C N O F Ne",
        "Na Mg Al Si P S Cl Ar",
        "K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr",
        "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe",
        "Cs Ba La Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn",
        "Fr Ra Ac Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og",
        "Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu",
        "Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr"
      ];
      const symbolsByAtomicNumber = [
        "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar",
        "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr",
        "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe",
        "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu",
        "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn",
        "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr",
        "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
      ];
      const atomicNumbers = new Map(symbolsByAtomicNumber.map((symbol, index) => [symbol, index + 1]));
      const metalloidNumbers = new Set([5, 14, 32, 33, 51, 52, 84]);
      const otherMetalNumbers = new Set([13, 31, 49, 50, 81, 82, 83, 113, 114, 115, 116]);
      const nonmetalNumbers = new Set([1, 6, 7, 8, 15, 16, 34]);
      const categoryColors = {
        alkali: "#f2a16f",
        alkaline: "#f4ca70",
        transition: "#87b7e8",
        otherMetal: "#78c9b0",
        metalloid: "#b5a0dc",
        nonmetal: "#86ce83",
        halogen: "#e99bc1",
        noble: "#81cbd5",
        lanthanoid: "#e6a0a0",
        actinoid: "#d891cb"
      };
      const mainGroupColumns = [0, 1, 12, 13, 14, 15, 16, 17];
      const classifyElement = (symbol, column) => {
        const atomicNumber = atomicNumbers.get(symbol);
        if (atomicNumber >= 57 && atomicNumber <= 71) return "lanthanoid";
        if (atomicNumber >= 89 && atomicNumber <= 103) return "actinoid";
        if (column === 0 && atomicNumber !== 1) return "alkali";
        if (column === 1) return "alkaline";
        if (column === 17) return "noble";
        if (column === 16) return "halogen";
        if (metalloidNumbers.has(atomicNumber)) return "metalloid";
        if (otherMetalNumbers.has(atomicNumber)) return "otherMetal";
        if (nonmetalNumbers.has(atomicNumber)) return "nonmetal";
        return "transition";
      };
      elements.forEach((rowSymbols, rowIndex) => {
        const symbols = rowSymbols.split(" ");
        let columns;
        if (rowIndex === 0) columns = [0, 17];
        else if (rowIndex === 1 || rowIndex === 2) columns = mainGroupColumns;
        else if (rowIndex < 7) columns = symbols.map((_, column) => column);
        else columns = symbols.map((_, column) => column + 2);

        symbols.forEach((symbol, elementIndex) => {
          const column = columns[elementIndex];
          const x = rowIndex >= 7 ? 110 + elementIndex * 36 : 57 + column * 36;
          const y = rowIndex < 7 ? 71 + rowIndex * 31 : 290 + (rowIndex - 7) * 30;
          const width = rowIndex >= 7 ? 34 : 34;
          const height = rowIndex >= 7 ? 25 : 27;
          const category = classifyElement(symbol, column);
          const tile = rect(x, y, width, height, categoryColors[category], {
            rx: "3",
            stroke: "#ffffff",
            "stroke-width": "1.5"
          });
          tile.setAttribute("aria-label", `${atomicNumbers.get(symbol)} ${symbol}`);
          const atomicNumber = addSvgElement(svg, "text", {
            x: String(x + 3),
            y: String(y + 8),
            fill: "#24384b",
            "font-family": "Arial, sans-serif",
            "font-size": "6",
            "font-weight": "600"
          });
          atomicNumber.textContent = String(atomicNumbers.get(symbol));
          const elementSymbol = addSvgElement(svg, "text", {
            x: String(x + width / 2),
            y: String(y + (rowIndex >= 7 ? 18 : 20)),
            fill: "#172b3d",
            "font-family": "Arial, sans-serif",
            "font-size": "12",
            "font-weight": "700",
            "text-anchor": "middle"
          });
          elementSymbol.textContent = symbol;
        });
      });
      const lanthanoidLabel = addSvgElement(svg, "text", {
        x: "50",
        y: "307",
        fill: "#43556a",
        "font-family": "Arial, sans-serif",
        "font-size": "8",
        "font-weight": "700"
      });
      lanthanoidLabel.textContent = "Lanthanides";
      const actinoidLabel = addSvgElement(svg, "text", {
        x: "50",
        y: "337",
        fill: "#43556a",
        "font-family": "Arial, sans-serif",
        "font-size": "8",
        "font-weight": "700"
      });
      actinoidLabel.textContent = "Actinides";
      break;
    }
    case "atom":
      ellipse(380, 183, 213, 67, "none", { stroke: palette[0], "stroke-width": "7", transform: "rotate(-30 380 183)" });
      ellipse(380, 183, 213, 67, "none", { stroke: palette[1], "stroke-width": "7", transform: "rotate(30 380 183)" });
      ellipse(380, 183, 213, 67, "none", { stroke: palette[2], "stroke-width": "7" });
      circle(380, 183, 37, "#ed6b76");
      for (const [x, y, color] of [[568, 96, "#398bd0"], [518, 266, "#55a86a"], [188, 183, "#efaa45"], [398, 118, "#965fcc"]]) circle(x, y, 13, color);
      for (const [x, y] of [[353, 169], [393, 198], [375, 203]]) circle(x, y, 9, "#ffe8a0");
      break;
    case "molecule":
      for (const [x1, y1, x2, y2, color] of [[275, 190, 360, 130, "#8d78cc"], [360, 130, 447, 189, "#ff9a55"], [447, 189, 530, 129, "#58b4c1"], [360, 130, 358, 242, "#e86d84"]]) line(x1, y1, x2, y2, color, 15);
      for (const [x, y, r, color] of [[275, 190, 31, "#e97583"], [360, 130, 36, "#8d78cc"], [447, 189, 34, "#f1b84d"], [530, 129, 29, "#59afc0"], [358, 242, 27, "#e97583"]]) {
        circle(x, y, r, color, { stroke: "#ffffff", "stroke-width": "6" });
        circle(x - 9, y - 10, r / 4, "#ffffff", { opacity: "0.6" });
      }
      break;
    case "gas":
      rect(276, 91, 207, 184, "#e8f4ff", { rx: "19", stroke: "#638bb7", "stroke-width": "8" });
      rect(288, 99, 183, 30, "#ab83d5", { rx: "8" });
      for (const [x, y, r, color] of [[320, 164, 11, "#ed7a76"], [420, 151, 9, "#438cc8"], [366, 219, 12, "#edaa43"], [435, 238, 8, "#60b48a"], [317, 238, 9, "#8c70c9"]]) circle(x, y, r, color);
      line(347, 81, 347, 48, "#8466bd", 7);
      line(410, 81, 410, 48, "#8466bd", 7);
      break;
    case "electron":
      rect(158, 122, 100, 122, "#fff1c9", { rx: "17", stroke: "#e5a844", "stroke-width": "8" });
      rect(502, 122, 100, 122, "#dff4ef", { rx: "17", stroke: "#48a99b", "stroke-width": "8" });
      line(258, 183, 497, 183, palette[0], 9, {
        "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})`
      });
      circle(304, 148, 13, "#e87887");
      circle(370, 148, 13, "#e87887");
      circle(436, 148, 13, "#e87887");
      circle(362, 218, 16, "#4e8fd1");
      circle(401, 218, 16, "#4e8fd1");
      break;
    case "energy":
      circle(272, 168, 53, "#f3c44b");
      path("M272 101V75M272 261V235M205 168H176M368 168H339M225 121L205 101M339 235L319 215", "none", { stroke: "#e79c38", "stroke-width": "7", "stroke-linecap": "round" });
      path("M365 244L430 100L481 201L532 119L597 242Z", "#ff9373", { stroke: "#ffffff", "stroke-width": "5" });
      path("M365 244L430 100L481 201L532 119L597 242Z", "none", { stroke: palette[0], "stroke-width": "7" });
      circle(477, 186, 15, "#fff2a6");
      break;
    case "instrument":
      rect(199, 242, 359, 18, "#557b9e", { rx: "9" });
      rect(260, 106, 53, 136, "#f7fbff", { rx: "10", stroke: "#4d83bc", "stroke-width": "7" });
      for (let tick = 0; tick < 5; tick += 1) line(271, 130 + tick * 22, 292, 130 + tick * 22, "#557b9e", 3);
      rect(363, 126, 106, 116, "#ffe7a5", { rx: "14", stroke: "#db9d3e", "stroke-width": "7" });
      line(381, 154, 450, 154, "#ffffff", 5);
      circle(416, 201, 24, "#ef8475");
      break;
    case "motion":
      path("M0 255Q180 242 380 259T760 247V360H0Z", "#b4dff1");
      path("M226 223L267 168H433L485 223V263H223Z", "#ed795f", { stroke: "#ffffff", "stroke-width": "6" });
      path("M284 179L310 179L310 215L257 215ZM329 179H419L452 215H329Z", "#cbeaff");
      circle(286, 262, 26, "#35475d");
      circle(425, 262, 26, "#35475d");
      circle(286, 262, 11, "#f2c14e");
      circle(425, 262, 11, "#f2c14e");
      path("M148 143H222M127 174H208M108 203H200", "none", { stroke: "#5389bc", "stroke-width": "8", "stroke-linecap": "round" });
      break;
    case "thermal":
      rect(276, 78, 205, 226, "#ffdf9b", { rx: "22", stroke: "#e8a34e", "stroke-width": "8" });
      for (const [x, color] of [[325, "#e76d6e"], [380, "#f3a04d"], [435, "#dc6179"]]) {
        path(`M${x} 266Q${x - 30} 220 ${x} 180T${x} 108`, "none", { stroke: color, "stroke-width": "12", "stroke-linecap": "round" });
      }
      circle(315, 143, 9, "#ffffff");
      circle(425, 207, 8, "#ffffff");
      break;
    case "wave":
      path("M110 183C155 78 200 78 245 183S335 288 380 183S470 78 515 183S605 288 650 183", "none", { stroke: "#438bd0", "stroke-width": "14", "stroke-linecap": "round" });
      rect(104, 152, 23, 62, "#f18c5c", { rx: "9" });
      for (const [x, y] of [[210, 130], [380, 235], [550, 130]]) circle(x, y, 12, "#edc44c");
      break;
    case "light":
      path("M155 105L155 251L382 184Z", "#ffd850");
      path("M382 184L553 102L553 266Z", "#78cbe2", { opacity: "0.78" });
      path("M383 184L637 148M383 184L637 218", "none", { stroke: "#ea6f9b", "stroke-width": "8" });
      path("M526 101L526 266", "none", { stroke: "#506f9a", "stroke-width": "7" });
      circle(155, 180, 44, "#ffad39");
      break;
    case "circuit":
      rect(208, 93, 332, 195, "#d9eef4", { rx: "24", stroke: "#507e9d", "stroke-width": "9" });
      path("M245 188H306M306 188V137H382V188H451V137H504V188H471V244H383V188", "none", { stroke: "#268c85", "stroke-width": "9", "stroke-linejoin": "round" });
      rect(246, 146, 42, 84, "#f2bc48", { rx: "9" });
      circle(383, 188, 24, "#ed7580", { stroke: "#ffffff", "stroke-width": "5" });
      circle(470, 137, 13, "#f6d457");
      break;
    case "magnet":
      path("M265 105V203Q265 287 380 287Q495 287 495 203V105H435V202Q435 229 380 229Q325 229 325 202V105Z", "#dc6277", { stroke: "#ffffff", "stroke-width": "7" });
      rect(265, 103, 60, 49, "#5288d3", { rx: "8" });
      rect(435, 103, 60, 49, "#ed6f73", { rx: "8" });
      path("M310 91Q380 44 450 91M287 69Q380 15 473 69M310 301Q380 337 450 301", "none", { stroke: "#7c6acb", "stroke-width": "5", "stroke-dasharray": "9 9" });
      break;
    case "crystal":
      path("M260 263L277 144L350 91L417 118L477 80L525 262Z", "#90d6c3", { stroke: "#278f80", "stroke-width": "8" });
      path("M277 144L347 262L350 91M350 91L417 262L417 118M417 118L477 262L477 80", "none", { stroke: "#ffffff", "stroke-width": "5" });
      path("M260 263H525L496 292H286Z", "#8fbbd9");
      break;
    case "rock":
      path("M0 192L104 102L210 170L324 75L424 163L548 94L760 174V360H0Z", "#8dc7a5");
      path("M0 232Q180 200 370 237T760 210V360H0Z", "#c78b58");
      path("M0 266Q180 239 365 271T760 248V360H0Z", "#dfbd67");
      path("M0 306Q170 275 390 310T760 288V360H0Z", "#826f9b");
      circle(322, 122, 15, "#e47658");
      circle(356, 133, 11, "#e6b748");
      break;
    case "soil":
      path("M0 128Q180 116 370 132T760 118V173H0Z", "#66b765");
      rect(0, 173, 760, 90, "#9c6a48");
      rect(0, 263, 760, 97, "#dbb76c");
      line(380, 128, 380, 206, "#387e45", 11);
      for (const [x, y] of [[326, 160], [434, 155], [310, 190], [450, 193]]) path(`M380 158Q${x} ${y - 30} ${x} ${y}Q${x + 23} ${y + 12} 380 173Z`, "#48a365");
      line(380, 202, 335, 286, "#f1d6a5", 5);
      line(380, 202, 417, 309, "#f1d6a5", 5);
      line(380, 202, 378, 333, "#f1d6a5", 5);
      for (const [x, y] of [[134, 214], [180, 287], [585, 223], [650, 315], [546, 318]]) ellipse(x, y, 15, 8, "#e4c98d");
      break;
    case "tectonic":
      path("M0 171L140 181L265 109L379 177L493 101L620 182L760 168V360H0Z", "#e09b63");
      path("M0 203L164 208L268 148L382 213L490 143L620 214L760 197V360H0Z", "#80679d");
      path("M0 243Q190 215 368 249T760 226V360H0Z", "#4d8ca3");
      path("M368 196L385 270M381 215L414 259", "none", { stroke: "#f1cb57", "stroke-width": "8", "stroke-linecap": "round" });
      break;
    case "water":
    case "climate":
      path("M0 227Q118 183 238 228T464 213T760 229V360H0Z", "#62c6cf");
      path("M0 250Q125 208 250 251T493 234T760 250", "none", { stroke: "#eafcff", "stroke-width": "8" });
      ellipse(182, 96, 40, 22, "#ffffff");
      ellipse(218, 94, 31, 26, "#ffffff");
      ellipse(540, 125, 43, 24, "#ffffff");
      ellipse(576, 124, 31, 26, "#ffffff");
      for (const x of [528, 559, 590]) line(x, 159, x - 11, 189, "#487dc1", 6);
      path("M99 230Q134 208 165 229", "none", { stroke: "#fff4b4", "stroke-width": "7" });
      break;
    case "mine":
      path("M0 217L171 92L305 194L452 73L621 199L760 121V360H0Z", "#9c8572");
      path("M0 257Q189 226 374 262T760 237V360H0Z", "#b77749");
      rect(292, 202, 180, 86, "#f2c556", { rx: "5" });
      path("M271 202L381 135L493 202Z", "#e67e49");
      rect(350, 157, 60, 45, "#fff0c2");
      rect(360, 238, 42, 50, "#7d8ca1");
      for (const [x, y] of [[170, 237], [537, 273], [584, 226]]) circle(x, y, 9, "#f4d26c");
      break;
    case "space":
    case "star":
    case "spectrum":
    case "comet":
    case "galaxy":
    case "telescope":
      rect(0, 0, 760, 360, "#283469");
      for (let star = 0; star < 35; star += 1) {
        const x = (star * 137 + 43) % 740 + 10;
        const y = (star * 83 + 27) % 330 + 10;
        circle(x, y, star % 5 === 0 ? 3 : 1.7, star % 4 === 0 ? "#ffe58a" : "#ffffff", { opacity: "0.9" });
      }
      if (scene === "telescope") {
        path("M251 196L425 106L470 152L298 244Z", "#d8e7ff", { stroke: "#738ac7", "stroke-width": "8" });
        path("M262 190L237 162L277 139L301 169ZM426 105L455 83L487 128L466 151Z", "#e59771");
        line(351, 218, 326, 302, "#c1d2ef", 10);
        line(351, 218, 413, 294, "#c1d2ef", 10);
      } else if (scene === "galaxy") {
        ellipse(390, 184, 168, 64, "#9274d4", { opacity: "0.5", transform: "rotate(-24 390 184)" });
        path("M241 198Q307 96 405 129Q492 158 465 217Q440 269 353 247Q292 231 325 183Q353 147 400 174", "none", { stroke: "#ef83bd", "stroke-width": "21", "stroke-linecap": "round" });
        circle(390, 184, 32, "#ffe491");
      } else if (scene === "comet") {
        path("M192 113Q379 46 554 101Q401 135 266 226Q420 145 537 162Q371 232 209 268Q311 195 192 113Z", "#73c6ee", { opacity: "0.72" });
        circle(557, 167, 35, "#e77c64", { stroke: "#ffda9b", "stroke-width": "9" });
      } else {
        circle(scene === "space" ? 505 : 384, 177, scene === "space" ? 92 : 63, scene === "space" ? "#d8d4cc" : "#ffc54e");
        if (scene === "space") {
          ellipse(505, 177, 133, 38, "none", { stroke: "#e8a6d4", "stroke-width": "12", transform: "rotate(-19 505 177)" });
          circle(475, 146, 12, "#b5aeb0");
          circle(537, 207, 17, "#b5aeb0");
        }
        if (scene === "star") {
          for (const [x, y, size, color] of [[180, 126, 32, "#ff9566"], [590, 109, 23, "#83d7e8"], [243, 244, 18, "#c990ea"]]) circle(x, y, size, color);
        }
        if (scene === "spectrum") {
          ["#e34c60", "#f6a53b", "#f5d348", "#59b977", "#479dd1", "#805ac7"].forEach((color, index) => rect(173 + index * 61, 273 - index % 2 * 8, 45, 31 + index % 2 * 8, color));
        }
      }
      break;
    case "taxonomy":
      circle(380, 97, 24, palette[1]);
      line(380, 121, 380, 167, palette[0], 7);
      line(218, 167, 542, 167, palette[0], 7);
      for (const x of [218, 326, 434, 542]) {
        line(x, 167, x, 213, palette[0], 6);
        circle(x, 235, 25, ["#e87570", "#54a9ca", "#7ebd72", "#b181d0"][[218, 326, 434, 542].indexOf(x)]);
      }
      line(272, 261, 488, 261, "#7694ad", 5);
      line(272, 261, 272, 291, "#7694ad", 5);
      line(488, 261, 488, 291, "#7694ad", 5);
      break;
    case "photosynthesis":
      circle(206, 127, 49, "#ffd04d");
      for (let ray = 0; ray < 8; ray += 1) {
        const angle = (ray * Math.PI) / 4;
        line(206 + Math.cos(angle) * 62, 127 + Math.sin(angle) * 62, 206 + Math.cos(angle) * 83, 127 + Math.sin(angle) * 83, "#f2a63b", 6);
      }
      line(405, 290, 405, 141, "#368c55", 13);
      for (const [x, y, flip] of [[352, 178, false], [458, 163, true], [347, 227, true], [463, 218, false]]) {
        path(flip ? `M405 ${y + 20}Q${x} ${y - 20} ${x} ${y}Q${x + 35} ${y + 19} 405 ${y + 20}Z` : `M405 ${y + 20}Q${x + 35} ${y - 20} ${x} ${y}Q${x - 20} ${y + 18} 405 ${y + 20}Z`, "#58ad68");
      }
      for (const [x, y, color] of [[280, 225, "#79b7e2"], [567, 132, "#ef9d66"], [577, 216, "#ef9d66"]]) circle(x, y, 11, color);
      line(258, 225, 319, 225, "#648bb4", 4, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      line(552, 207, 596, 207, "#648bb4", 4, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      break;
    case "transport":
      path("M340 285V120Q380 92 420 120V285Z", "#e8d1a4", { stroke: "#38865b", "stroke-width": "9" });
      path("M366 273V143M394 273V143", "none", { stroke: "#dc765e", "stroke-width": "9" });
      line(380, 262, 380, 93, "#4b8ec1", 7, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      for (const [x, y] of [[280, 165], [495, 187], [294, 226], [483, 243]]) {
        path(`M380 145Q${x} ${y - 35} ${x} ${y}Q${x + 46} ${y + 24} 380 180Z`, "#63b574");
      }
      break;
    case "digestion":
      path("M364 89V137Q306 150 329 205Q346 241 378 219Q427 189 408 153Q396 134 396 89Z", "#e98491", { stroke: "#bd5873", "stroke-width": "8" });
      path("M380 215Q326 225 346 254Q360 275 396 258Q424 246 414 227Q406 215 380 215Z", "#efb14f", { stroke: "#cc8244", "stroke-width": "6" });
      path("M380 253Q324 270 365 297Q401 319 434 293Q452 273 418 258", "none", { stroke: "#d86d7d", "stroke-width": "14", "stroke-linecap": "round" });
      circle(378, 171, 9, "#ffd15b");
      circle(364, 193, 7, "#74bad4");
      break;
    case "mitochondria":
      path("M190 186Q220 83 363 124Q420 88 536 157Q590 244 455 270Q367 313 240 251Q188 230 190 186Z", "#f1a67f", { stroke: "#cf6b64", "stroke-width": "9" });
      path("M244 190Q278 135 312 196T380 195T448 196T510 190", "none", { stroke: "#fff1d3", "stroke-width": "11", "stroke-linecap": "round" });
      path("M255 226Q289 170 325 231T393 230T461 231T505 221", "none", { stroke: "#df6c81", "stroke-width": "8", "stroke-linecap": "round" });
      for (const [x, y] of [[248, 148], [498, 157], [527, 234]]) circle(x, y, 8, "#f7d256");
      break;
    case "flower":
      for (let petal = 0; petal < 8; petal += 1) {
        const angle = petal * Math.PI / 4;
        ellipse(380 + Math.cos(angle) * 49, 163 + Math.sin(angle) * 49, 24, 39, petal % 2 ? "#e87da5" : "#ffad68", { transform: `rotate(${petal * 45} ${380 + Math.cos(angle) * 49} ${163 + Math.sin(angle) * 49})` });
      }
      circle(380, 163, 29, "#f6d454");
      line(380, 193, 380, 314, "#438e59", 11);
      path("M380 250Q310 206 294 256Q326 283 380 266ZM380 278Q439 224 468 254Q446 290 380 294Z", "#62b56e");
      for (const [x, y] of [[244, 112], [277, 91], [217, 148]]) circle(x, y, 5, "#e6a52c");
      break;
    case "evolution":
      line(150, 259, 607, 259, "#8a6547", 8);
      for (const [x, body, beak] of [[245, "#e97762", 20], [380, "#6b91ce", 38], [515, "#74b56e", 55]]) {
        ellipse(x, 214, 47, 34, body);
        circle(x + 24, 188, 24, body);
        path(`M${x + 44} 188L${x + 44 + beak} 197L${x + 42} 202Z`, "#f2bf4b");
        circle(x + 30, 181, 4, "#263b4b");
        path(`M${x - 12} 213Q${x + 5} 185 ${x + 17} 218`, "none", { stroke: "#fff0c7", "stroke-width": "6" });
        line(x, 244, x - 7, 259, "#815c43", 4);
        line(x + 17, 244, x + 20, 259, "#815c43", 4);
      }
      break;
    case "immune":
      path("M380 78L516 126V202Q501 274 380 312Q259 274 244 202V126Z", "#7bc7dc", { stroke: "#367f9f", "stroke-width": "10" });
      path("M334 193L366 225L430 157", "none", { stroke: "#ffffff", "stroke-width": "17", "stroke-linecap": "round", "stroke-linejoin": "round" });
      for (const [x, y] of [[176, 137], [576, 127], [570, 246], [190, 267]]) {
        circle(x, y, 17, "#e87181", { stroke: "#b94c67", "stroke-width": "4" });
        for (let spike = 0; spike < 6; spike += 1) {
          const angle = spike * Math.PI / 3;
          line(x + Math.cos(angle) * 19, y + Math.sin(angle) * 19, x + Math.cos(angle) * 27, y + Math.sin(angle) * 27, "#b94c67", 4);
        }
      }
      break;
    case "foodweb":
      for (const [x1, y1, x2, y2] of [[220, 105, 355, 170], [220, 260, 355, 190], [398, 179, 540, 104], [399, 193, 540, 263], [220, 105, 540, 104], [220, 260, 540, 263]]) {
        line(x1, y1, x2, y2, "#518bad", 4, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      }
      for (const [x, y, color] of [[200, 103, "#57a76f"], [200, 262, "#dfad4a"], [376, 182, "#6a93cf"], [560, 101, "#df765f"], [560, 265, "#9a74c8"]]) {
        circle(x, y, 34, color, { stroke: "#ffffff", "stroke-width": "5" });
        circle(x - 8, y - 8, 6, "#ffffff", { opacity: "0.65" });
      }
      break;
    case "environment-foodweb":
      path("M248 257L380 92L512 257Z", "#d6eaa9", { stroke: "#60966b", "stroke-width": "7" });
      line(380, 126, 380, 220, "#638bad", 5, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      line(325, 180, 350, 222, "#638bad", 5, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      line(435, 180, 410, 222, "#638bad", 5, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      for (const [x, y, color] of [[380, 92, "#dce576"], [325, 180, "#e88767"], [435, 180, "#758bca"], [380, 257, "#56a77c"]]) circle(x, y, 22, color, { stroke: "#ffffff", "stroke-width": "4" });
      break;
    case "stoichiometry":
      line(380, 98, 380, 275, "#627f9b", 10);
      line(286, 137, 474, 137, "#627f9b", 9);
      circle(380, 122, 19, "#e6a84a");
      line(305, 138, 273, 208, "#627f9b", 5);
      line(305, 138, 337, 208, "#627f9b", 5);
      line(455, 138, 423, 208, "#627f9b", 5);
      line(455, 138, 487, 208, "#627f9b", 5);
      path("M251 208Q305 257 359 208Z", "#75c4d1", { stroke: "#5189a5", "stroke-width": "5" });
      path("M401 208Q455 257 509 208Z", "#e98983", { stroke: "#b96870", "stroke-width": "5" });
      for (let i = 0; i < 3; i += 1) circle(283 + i * 24, 220 + (i % 2) * 9, 7, "#ffffff");
      for (let i = 0; i < 2; i += 1) circle(439 + i * 27, 222 + (i % 2) * 8, 8, "#ffffff");
      break;
    case "acid-base":
      rect(140, 234, 480, 34, "#f1d7b9", { rx: "16" });
      for (let i = 0; i < 7; i += 1) {
        const colors = ["#e66d75", "#ef9364", "#f1bd50", "#a9c968", "#5bb9a6", "#5a9bd0", "#7b69c6"];
        rect(155 + i * 65, 238, 61, 26, colors[i], { rx: "7" });
        circle(185 + i * 65, 251, 8, "#ffffff", { opacity: "0.7" });
      }
      path("M268 103H359L349 224H279Z", "#e97879", { opacity: "0.86", stroke: "#a75c73", "stroke-width": "7" });
      path("M404 103H495L485 224H415Z", "#62bbcf", { opacity: "0.86", stroke: "#4187a2", "stroke-width": "7" });
      line(310, 90, 310, 72, "#ad5b6e", 5);
      line(450, 90, 450, 72, "#47899b", 5);
      break;
    case "collision":
      circle(230, 178, 29, "#e77777");
      circle(531, 178, 29, "#559fd0");
      line(278, 178, 395, 178, "#7792ae", 5, { "stroke-dasharray": "11 9" });
      line(483, 178, 366, 178, "#7792ae", 5, { "stroke-dasharray": "11 9" });
      circle(380, 178, 17, "#f4bd48", { stroke: "#ffffff", "stroke-width": "5" });
      for (const [x, y] of [[333, 123], [427, 123], [333, 233], [427, 233]]) {
        line(380, 178, x, y, "#a687c5", 4, { "stroke-dasharray": "7 8" });
        circle(x, y, 11, "#8dc9a2");
      }
      break;
    case "calorimetry":
      rect(287, 100, 186, 185, "#ffffff", { rx: "16", opacity: "0.8", stroke: "#627e9b", "stroke-width": "8" });
      rect(300, 211, 160, 60, "#ef8d72", { rx: "8" });
      line(380, 86, 380, 213, "#dc535a", 8);
      circle(380, 218, 17, "#dc535a");
      for (let i = 0; i < 5; i += 1) line(454, 122 + i * 24, 472, 122 + i * 24, "#627e9b", 4);
      path("M267 303Q380 269 493 303", "none", { stroke: "#edae4f", "stroke-width": "8" });
      break;
    case "organic":
      for (const [x1, y1, x2, y2] of [[220, 178, 300, 130], [300, 130, 380, 178], [380, 178, 460, 130], [460, 130, 540, 178], [300, 130, 300, 239], [460, 130, 460, 239]]) line(x1, y1, x2, y2, "#627b97", 10);
      for (const [x, y] of [[220, 178], [300, 130], [380, 178], [460, 130], [540, 178], [300, 239], [460, 239]]) {
        circle(x, y, 26, x === 300 || x === 460 ? "#e56f78" : "#78a6dc", { stroke: "#ffffff", "stroke-width": "5" });
      }
      break;
    case "electrolysis":
      rect(251, 164, 258, 118, "#8bd2d4", { opacity: "0.75", stroke: "#5287a1", "stroke-width": "7" });
      rect(293, 102, 28, 137, "#e2ba69", { rx: "7" });
      rect(439, 102, 28, 137, "#a3aab7", { rx: "7" });
      line(307, 101, 307, 73, "#d85c67", 7);
      line(453, 101, 453, 73, "#578ec8", 7);
      for (const [x, y, color, direction] of [[350, 207, "#e56b74", 1], [391, 236, "#5b91d0", -1], [420, 191, "#e56b74", -1], [341, 242, "#5b91d0", 1]]) {
        circle(x, y, 12, color);
        line(x, y - 18, x + direction * 26, y - 18, "#607f9d", 3, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      }
      break;
    case "test-tubes":
      for (const [x, liquid] of [[206, "#e98472"], [320, "#68b4d0"], [434, "#edc14f"], [548, "#8d76c4"]]) {
        path(`M${x} 102H${x + 54}V225Q${x + 27} 258 ${x} 225Z`, "#ffffff", { opacity: "0.68", stroke: "#557e9c", "stroke-width": "6" });
        path(`M${x + 5} 179H${x + 49}V225Q${x + 27} 248 ${x + 5} 225Z`, liquid);
        line(x - 3, 102, x + 57, 102, "#557e9c", 7);
      }
      break;
    case "induction":
      path("M285 133V214Q285 268 380 268Q475 268 475 214V133H432V212Q432 230 380 230Q328 230 328 212V133Z", "#d76579", { stroke: "#ffffff", "stroke-width": "6" });
      rect(172, 147, 112, 48, "#488bc8", { rx: "12" });
      rect(476, 147, 112, 48, "#e46e73", { rx: "12" });
      line(199, 112, 261, 112, "#507ea7", 5, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      line(561, 227, 498, 227, "#507ea7", 5, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      for (let i = 0; i < 4; i += 1) circle(350 + i * 20, 179 + (i % 2) * 18, 6, "#ffd55a");
      break;
    case "semiconductor":
      rect(277, 93, 206, 177, "#40577a", { rx: "18", stroke: "#263c5d", "stroke-width": "9" });
      rect(315, 132, 130, 98, "#8ed7cf", { rx: "13" });
      for (const y of [118, 153, 188, 223, 258]) {
        line(240, y, 277, y, "#d8b965", 7);
        line(483, y, 520, y, "#d8b965", 7);
      }
      path("M338 195L363 162L389 199L420 149", "none", { stroke: "#e56779", "stroke-width": "9", "stroke-linecap": "round", "stroke-linejoin": "round" });
      circle(363, 162, 8, "#ffffff");
      circle(420, 149, 8, "#ffffff");
      break;
    case "nucleus":
      circle(380, 181, 49, "#e77876", { stroke: "#b64d61", "stroke-width": "7" });
      for (const [x, y, color] of [[356, 160, "#f4c65a"], [399, 172, "#7c79cf"], [370, 200, "#f4c65a"], [401, 205, "#7c79cf"]]) circle(x, y, 11, color);
      path("M430 152Q500 100 560 121M433 181Q511 181 576 181M430 210Q502 261 563 244", "none", { stroke: "#67afd2", "stroke-width": "7", "stroke-dasharray": "11 9" });
      for (const [x, y] of [[577, 121], [591, 181], [574, 244]]) circle(x, y, 9, "#67afd2");
      break;
    case "weather-cycle":
      circle(182, 105, 39, "#ffd05a");
      ellipse(376, 119, 60, 30, "#ffffff");
      ellipse(418, 119, 42, 32, "#ffffff");
      path("M0 245Q172 205 347 245T760 228V360H0Z", "#59bcae");
      path("M0 271Q176 238 340 269T760 255V360H0Z", "#8bc878");
      for (const x of [372, 411, 450]) line(x, 158, x - 14, 195, "#528fd1", 5);
      line(185, 174, 243, 220, "#e9a841", 5, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      break;
    case "environment-climate":
      circle(380, 205, 83, "#69b9d5", { stroke: "#ffffff", "stroke-width": "7" });
      path("M320 203Q344 179 364 200T410 196T443 207", "none", { stroke: "#65b779", "stroke-width": "22", "stroke-linecap": "round" });
      circle(180, 111, 37, "#ffd15a");
      path("M380 92Q270 92 229 149M380 92Q490 92 531 149", "none", { stroke: "#ed9262", "stroke-width": "8", "stroke-dasharray": "13 10", "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      path("M267 284Q380 323 493 284", "none", { stroke: "#8d76c5", "stroke-width": "10", "stroke-linecap": "round" });
      break;
    case "aquifer":
      path("M0 116Q170 88 350 119T760 105V172H0Z", "#65b96e");
      path("M0 172Q190 153 375 181T760 158V239H0Z", "#c6a169");
      path("M0 239Q190 213 376 245T760 224V304H0Z", "#66b6cf");
      path("M0 304Q182 285 380 311T760 294V360H0Z", "#aa8058");
      line(552, 117, 552, 254, "#746452", 12);
      line(541, 118, 563, 118, "#746452", 8);
      for (const [x, y] of [[191, 273], [260, 290], [334, 264], [414, 292]]) circle(x, y, 9, "#e7f9ff");
      break;
    case "landslide":
      path("M0 120L252 103L520 275L760 285V360H0Z", "#a77351");
      path("M0 97L255 82L520 255L760 270V295L516 282L248 113L0 128Z", "#64ae69");
      path("M330 154L430 195L408 226L505 259L472 293L366 234L392 202L310 180Z", "#d58c4e");
      for (const [x, y] of [[155, 173], [211, 181], [583, 299], [635, 303]]) circle(x, y, 15, "#81727a");
      line(260, 115, 338, 160, "#fff3c5", 6, { "stroke-dasharray": "8 8" });
      break;
    case "eclipse":
      circle(380, 180, 93, "#f4bc50");
      circle(425, 164, 82, "#5b65a8");
      for (let ray = 0; ray < 8; ray += 1) {
        const angle = ray * Math.PI / 4;
        line(380 + Math.cos(angle) * 111, 180 + Math.sin(angle) * 111, 380 + Math.cos(angle) * 145, 180 + Math.sin(angle) * 145, "#f4bc50", 5);
      }
      circle(570, 102, 20, "#d9d5cb");
      break;
    case "orbit":
      circle(380, 180, 51, "#ffd04f");
      ellipse(380, 180, 222, 98, "none", { stroke: "#7184cf", "stroke-width": "6", transform: "rotate(-23 380 180)" });
      ellipse(380, 180, 157, 66, "none", { stroke: "#9c78d0", "stroke-width": "5", transform: "rotate(31 380 180)" });
      circle(585, 95, 19, "#5b9bd2");
      circle(235, 231, 26, "#df846c");
      circle(455, 115, 16, "#71b99a");
      break;
    case "nebula":
      path("M138 205Q199 81 310 127Q378 65 453 120Q563 83 619 196Q542 291 434 249Q330 309 246 255Z", "#8766ca", { opacity: "0.82" });
      path("M219 200Q278 135 346 167Q396 115 468 173Q518 222 445 244Q373 224 319 260Q266 248 219 200Z", "#e982ad", { opacity: "0.86" });
      for (const [x, y] of [[230, 131], [511, 132], [564, 237], [306, 282], [430, 93]]) circle(x, y, 8, "#fff2a6");
      break;
    case "sun":
      circle(380, 180, 92, "#ffbd47", { stroke: "#ef764b", "stroke-width": "9" });
      for (let ray = 0; ray < 16; ray += 1) {
        const angle = ray * Math.PI / 8;
        line(380 + Math.cos(angle) * 112, 180 + Math.sin(angle) * 112, 380 + Math.cos(angle) * 145, 180 + Math.sin(angle) * 145, "#ef9950", 6);
      }
      path("M328 161Q350 142 370 162T408 160", "none", { stroke: "#e87861", "stroke-width": "9", "stroke-linecap": "round" });
      circle(418, 207, 11, "#dc765c");
      break;
    case "cosmos":
      circle(380, 183, 33, "#fff3ad");
      for (let ring = 0; ring < 4; ring += 1) {
        ellipse(380, 183, 100 + ring * 47, 31 + ring * 14, "none", { stroke: ["#e57eb4", "#69b9d2", "#a782df", "#f1ae5a"][ring], "stroke-width": "5", transform: `rotate(${ring * 33 - 45} 380 183)` });
      }
      for (const [x, y] of [[240, 108], [532, 132], [554, 249], [218, 268], [420, 287]]) circle(x, y, 7, "#ffffff");
      break;
    case "habitat":
      path("M0 239Q143 186 276 238T528 218T760 236V360H0Z", "#75bd72");
      path("M0 276Q164 248 334 278T760 261V360H0Z", "#61bec2");
      for (const [x, y, color] of [[172, 161, "#3c8d5d"], [572, 168, "#438c65"]]) {
        rect(x - 6, y + 24, 12, 61, "#855f42", { rx: "5" });
        circle(x, y, 39, color);
      }
      path("M351 242Q375 201 411 240Q429 264 397 275H345Z", "#dc9755");
      circle(411, 233, 11, "#dc9755");
      break;
    case "pollution":
      path("M0 235Q190 207 380 239T760 219V360H0Z", "#61b7c5");
      path("M0 283Q180 261 360 285T760 271V360H0Z", "#4d8d9b");
      for (const [x, y, width, height] of [[205, 181, 56, 68], [298, 148, 79, 101], [419, 174, 61, 75]]) {
        rect(x, y, width, height, "#7c7385", { rx: "8" });
        rect(x + 13, y - 19, 15, 22, "#7c7385");
        rect(x + width - 22, y - 36, 14, 39, "#7c7385");
        circle(x + width / 2, y + 30, 9, "#f5c05c");
      }
      for (const [x, y] of [[276, 108], [315, 91], [357, 116], [488, 132]]) circle(x, y, 15, "#8c8c9c", { opacity: "0.8" });
      break;
    case "water-quality":
      rect(154, 102, 452, 199, "#b4e6e9", { rx: "22", stroke: "#5389a8", "stroke-width": "8" });
      path("M164 205Q272 183 380 205T596 195V291H164Z", "#55b6ca");
      for (const [x, y, color] of [[230, 170, "#e67274"], [312, 150, "#67a86e"], [420, 168, "#f0b949"], [515, 153, "#9476c2"]]) {
        circle(x, y, 17, color);
        circle(x - 5, y - 6, 5, "#ffffff", { opacity: "0.75" });
      }
      line(214, 124, 214, 93, "#62839b", 6);
      line(546, 124, 546, 93, "#62839b", 6);
      break;
    case "sustainability":
      circle(380, 173, 84, "#75c87c");
      path("M380 227Q338 178 387 112Q433 165 398 215Z", "#f7f2ca", { stroke: "#ffffff", "stroke-width": "5" });
      path("M384 211L410 151", "none", { stroke: "#66a86e", "stroke-width": "6" });
      path("M184 247Q231 195 279 247", "none", { stroke: "#e29d48", "stroke-width": "8", "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      path("M480 247Q531 195 577 247", "none", { stroke: "#478fc2", "stroke-width": "8", "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      break;
    case "ghana-habitats":
      path("M0 231Q124 193 244 230T473 212T760 230V360H0Z", "#7bbd70");
      path("M0 274Q182 244 355 276T760 259V360H0Z", "#d9bc73");
      for (const [x, y, color] of [[164, 166, "#397d59"], [569, 159, "#33896b"]]) {
        rect(x - 7, y + 19, 14, 71, "#865d3f");
        circle(x, y, 39, color);
      }
      path("M334 245L379 201L422 245Z", "#e0a157", { stroke: "#fff0ca", "stroke-width": "5" });
      rect(349, 242, 61, 32, "#f4dfae");
      break;
    case "conservation":
      path("M380 82L491 121V198Q477 269 380 301Q283 269 269 198V121Z", "#71bd93", { stroke: "#398a70", "stroke-width": "9" });
      path("M381 250Q323 184 383 119Q442 180 402 238Z", "#f5f1d5");
      path("M389 226L418 155", "none", { stroke: "#45925d", "stroke-width": "7" });
      for (const [x, y] of [[188, 132], [576, 145], [195, 260], [566, 259]]) circle(x, y, 23, "#e3ad5f");
      break;
    case "algorithm":
      rect(328, 78, 105, 46, "#78c2a7", { rx: "21", stroke: "#438c83", "stroke-width": "5" });
      path("M327 148H433L469 184L433 220H327L291 184Z", "#f0c25b", { stroke: "#b78c45", "stroke-width": "5" });
      rect(328, 243, 105, 46, "#db8190", { rx: "7", stroke: "#ad5a72", "stroke-width": "5" });
      line(380, 124, 380, 145, "#597996", 5, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      line(380, 220, 380, 239, "#597996", 5, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      break;
    case "string":
      rect(228, 113, 304, 134, "#283c60", { rx: "17", stroke: "#657fa3", "stroke-width": "7" });
      for (const [x, letter] of [[272, "H"], [331, "i"], [390, "!"], [449, "A"]]) {
        const text = addSvgElement(svg, "text", { x: String(x), y: "197", fill: palette[1], "font-family": "Arial, sans-serif", "font-size": "49", "font-weight": "700", "text-anchor": "middle" });
        text.textContent = letter;
      }
      line(250, 274, 510, 274, "#78c7dc", 6);
      break;
    case "variables":
      for (const [x, name, color] of [[172, "x", "#e77a78"], [330, "score", "#5ba9ca"], [494, "name", "#8b72c4"]]) {
        rect(x, 131, 116, 96, "#ffffff", { rx: "15", stroke: color, "stroke-width": "7" });
        const text = addSvgElement(svg, "text", { x: String(x + 58), y: "191", fill: color, "font-family": "Arial, sans-serif", "font-size": name === "score" ? "22" : "35", "font-weight": "700", "text-anchor": "middle" });
        text.textContent = name;
        circle(x + 58, 255, 11, color);
      }
      break;
    case "calculator":
      rect(285, 67, 190, 244, "#435677", { rx: "22", stroke: "#263950", "stroke-width": "8" });
      rect(309, 91, 142, 53, "#d8f2d9", { rx: "7" });
      for (let row = 0; row < 3; row += 1) {
        for (let column = 0; column < 3; column += 1) circle(325 + column * 52, 178 + row * 42, 14, (row + column) % 3 === 0 ? "#e9a84d" : "#83b4d1");
      }
      rect(413, 164, 31, 112, "#dd7775", { rx: "7" });
      break;
    case "code":
      rect(179, 78, 402, 222, "#253a5b", { rx: "18", stroke: "#6680a4", "stroke-width": "7" });
      for (const [y, width, color] of [[122, 178, "#f1bf58"], [160, 238, "#79c6b1"], [198, 166, "#e58aa4"], [236, 207, "#8fa9e1"]]) rect(217, y, width, 12, color, { rx: "6" });
      path("M495 156L529 187L495 218M264 218L230 187L264 156", "none", { stroke: "#ffffff", "stroke-width": "8", "stroke-linecap": "round", "stroke-linejoin": "round" });
      break;
    case "conditional":
      path("M380 89L496 176L380 263L264 176Z", "#f1c45a", { stroke: "#a68045", "stroke-width": "7" });
      const yes = addSvgElement(svg, "text", { x: "514", y: "146", fill: "#398f72", "font-family": "Arial, sans-serif", "font-size": "24", "font-weight": "700" });
      yes.textContent = "YES";
      const no = addSvgElement(svg, "text", { x: "195", y: "245", fill: "#d86b70", "font-family": "Arial, sans-serif", "font-size": "24", "font-weight": "700" });
      no.textContent = "NO";
      line(466, 153, 550, 111, "#398f72", 6, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      line(294, 199, 218, 244, "#d86b70", 6, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      break;
    case "loop":
      path("M260 158Q284 93 371 99Q467 105 488 166", "none", { stroke: "#4c9fc4", "stroke-width": "15", "stroke-linecap": "round", "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      path("M495 205Q466 269 379 265Q283 263 264 197", "none", { stroke: "#e98a62", "stroke-width": "15", "stroke-linecap": "round", "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      rect(315, 148, 130, 69, "#ffffff", { rx: "15", stroke: "#7189a4", "stroke-width": "6" });
      circle(380, 182, 18, "#f3c44d");
      break;
    case "debugger":
      rect(257, 78, 246, 200, "#293c5c", { rx: "17", stroke: "#687ea0", "stroke-width": "7" });
      for (let row = 0; row < 4; row += 1) line(290, 121 + row * 35, 452, 121 + row * 35, row === 2 ? "#e56e75" : "#87c7b6", 8);
      circle(380, 184, 35, "#f2c44e", { opacity: "0.95" });
      line(405, 210, 444, 249, "#526b8b", 12);
      break;
    case "function":
      circle(380, 177, 79, "#8d77ca", { stroke: "#6655a3", "stroke-width": "7" });
      const functionLabel = addSvgElement(svg, "text", { x: "380", y: "189", fill: "#ffffff", "font-family": "Arial, sans-serif", "font-size": "31", "font-weight": "700", "text-anchor": "middle" });
      functionLabel.textContent = "f(x)";
      line(166, 177, 284, 177, "#5a9ec2", 9, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      line(476, 177, 594, 177, "#e78860", 9, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      circle(147, 177, 17, "#69b99a");
      circle(613, 177, 17, "#eab44f");
      break;
    case "list":
      for (let i = 0; i < 5; i += 1) {
        rect(260, 82 + i * 46, 240, 36, i % 2 ? "#e6f2ff" : "#ffffff", { rx: "8", stroke: "#7a98b7", "stroke-width": "3" });
        circle(283, 100 + i * 46, 10, ["#df7775", "#66b5a0", "#668fce", "#e2ad4f", "#9a74c5"][i]);
        line(307, 100 + i * 46, 472, 100 + i * 46, "#7992ad", 5);
      }
      break;
    case "web":
      rect(188, 75, 384, 218, "#ffffff", { rx: "16", stroke: "#415b7d", "stroke-width": "8" });
      rect(188, 75, 384, 42, "#6499ca", { rx: "14" });
      circle(214, 96, 6, "#ffdb72");
      circle(234, 96, 6, "#ffdb72");
      rect(218, 142, 123, 109, "#78c6d0", { rx: "8" });
      rect(360, 143, 181, 13, "#7a90a8", { rx: "6" });
      rect(360, 171, 157, 10, "#a1b4c7", { rx: "5" });
      rect(360, 199, 172, 10, "#a1b4c7", { rx: "5" });
      rect(360, 228, 83, 20, "#e98c69", { rx: "8" });
      break;
    case "dictionary":
      rect(213, 81, 334, 215, "#f8f1df", { rx: "13", stroke: "#9e8055", "stroke-width": "7" });
      line(380, 88, 380, 289, "#bd9d6c", 5);
      for (let i = 0; i < 4; i += 1) {
        line(243, 126 + i * 35, 350, 126 + i * 35, "#7792aa", 5);
        line(407, 126 + i * 35, 520, 126 + i * 35, "#7792aa", 5);
      }
      circle(273, 109, 8, "#e57c75");
      circle(438, 109, 8, "#6aa7c4");
      break;
    case "network":
      for (const [x1, y1, x2, y2] of [[200, 177, 350, 109], [200, 177, 350, 249], [350, 109, 510, 177], [350, 249, 510, 177], [350, 109, 350, 249]]) line(x1, y1, x2, y2, "#6786a6", 7);
      for (const [x, y, color] of [[200, 177, "#e9826d"], [350, 109, "#60b9b2"], [350, 249, "#edbd52"], [510, 177, "#8b76c7"]]) {
        circle(x, y, 34, color, { stroke: "#ffffff", "stroke-width": "6" });
        circle(x - 8, y - 8, 7, "#ffffff", { opacity: "0.72" });
      }
      break;
    case "development":
      for (const [x, head, height, color] of [[230, 36, 81, "#82b6cf"], [380, 50, 119, "#de987c"], [530, 59, 158, "#7e8fc7"]]) {
        circle(x, 242 - height, head / 2, "#eab18d");
        path(`M${x - 43} 283Q${x - 38} ${242 - height + 28} ${x} ${242 - height + 28}Q${x + 38} ${242 - height + 28} ${x + 43} 283Z`, color);
        line(x - 20, 286, x - 23, 320, "#6d5f58", 5);
        line(x + 20, 286, x + 23, 320, "#6d5f58", 5);
      }
      break;
    case "conditioning":
      circle(238, 178, 36, "#e7ad61");
      path("M226 178H250M238 166V190", "none", { stroke: "#ffffff", "stroke-width": "6", "stroke-linecap": "round" });
      line(286, 178, 354, 178, "#7089a2", 6, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      circle(402, 178, 43, "#84b6d0");
      path("M378 179L394 194L425 159", "none", { stroke: "#ffffff", "stroke-width": "7", "stroke-linecap": "round", "stroke-linejoin": "round" });
      line(451, 178, 506, 178, "#7089a2", 6, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      circle(547, 178, 37, "#e6838a");
      for (const [x, y] of [[547, 130], [547, 226], [499, 178], [595, 178]]) line(547, 178, x, y, "#bf5d71", 4);
      break;
    case "social":
      circle(316, 135, 32, "#e5a982");
      circle(442, 135, 32, "#d79572");
      path("M250 286Q257 187 316 187Q376 187 382 286Z", "#6897cc");
      path("M378 286Q384 187 442 187Q503 187 508 286Z", "#da8e76");
      line(337, 213, 419, 213, "#e9bd56", 7, { "marker-end": `url(#lesson-picture-arrow-${lesson.id}-${pageIndex})` });
      circle(380, 151, 12, "#fff1c4");
      break;
    case "personality":
      circle(380, 174, 75, "#e9b15f", { stroke: "#bf8743", "stroke-width": "7" });
      for (const [x, y, color] of [[352, 151, "#78b7cf"], [406, 151, "#e47d78"], [352, 197, "#82b779"], [406, 197, "#a27ccc"]]) circle(x, y, 17, color, { stroke: "#ffffff", "stroke-width": "4" });
      path("M367 221Q380 232 393 221", "none", { stroke: "#ffffff", "stroke-width": "5", "stroke-linecap": "round" });
      for (const [x, y, color] of [[213, 111, "#e8836e"], [543, 112, "#5bb7b0"], [213, 250, "#758ed0"], [543, 250, "#e1b54a"]]) circle(x, y, 25, color);
      break;
    case "mental-health":
      path("M380 115Q345 76 316 111Q289 147 380 220Q471 147 444 111Q415 76 380 115Z", "#e86f83", { stroke: "#bb536e", "stroke-width": "6" });
      path("M234 258Q380 298 526 258", "none", { stroke: "#5d9ec0", "stroke-width": "12", "stroke-linecap": "round" });
      circle(259, 248, 19, "#f3c057");
      circle(501, 248, 19, "#7a78c9");
      path("M288 282Q380 320 472 282", "none", { stroke: "#71b78e", "stroke-width": "8", "stroke-linecap": "round" });
      break;
    case "recycling":
      path("M269 117L310 91L342 143L317 157Z", "#3fa986");
      path("M326 87L396 87L414 120L383 120L369 103L338 103Z", "#4daed0");
      path("M451 129L480 180L447 200L431 172L414 173L430 145Z", "#e29a45");
      path("M447 211L405 270L368 249L389 220L381 202L419 201Z", "#bd68a0");
      path("M354 258L286 258L267 226L299 226L311 243L343 243Z", "#64b975");
      path("M263 207L232 156L265 136L282 164L299 164L282 192Z", "#e46d74");
      circle(380, 180, 31, "#fff2bf");
      break;
    case "computer":
    case "binary":
    case "database":
      rect(184, 76, 392, 219, "#39486e", { rx: "22", stroke: "#253653", "stroke-width": "9" });
      rect(206, 98, 348, 172, scene === "binary" ? "#1a3153" : "#e1f1ff", { rx: "10" });
      if (scene === "binary") {
        for (let row = 0; row < 4; row += 1) {
          for (let column = 0; column < 8; column += 1) {
            rect(225 + column * 39, 117 + row * 33, 28, 22, (row + column) % 2 ? palette[0] : palette[1], { rx: "5" });
          }
        }
      } else if (scene === "database") {
        for (let row = 0; row < 4; row += 1) {
          rect(264, 117 + row * 31, 230, 22, row === 0 ? "#70c6af" : "#bed8ee", { rx: "5" });
          circle(284, 128 + row * 31, 5, "#ffffff");
        }
      } else {
        for (let row = 0; row < 4; row += 1) {
          rect(231, 119 + row * 31, 12 + (row % 2) * 12, 7, palette[row % palette.length], { rx: "3" });
          rect(255, 119 + row * 31, 177 + row * 19, 7, "#7b91af", { rx: "3" });
        }
      }
      path("M149 297H611L563 326H195Z", "#768bad", { stroke: "#39486e", "stroke-width": "6" });
      rect(320, 298, 122, 12, "#d5e7fa", { rx: "6" });
      break;
    case "brain":
    case "memory":
    case "research":
    case "people":
    case "senses":
    case "wellbeing":
      if (scene === "brain" || scene === "memory") {
        path("M379 104Q345 56 300 85Q270 99 281 132Q245 153 273 189Q250 226 290 244Q301 277 345 257Q365 286 384 257Q408 282 433 255Q470 269 480 232Q520 211 492 178Q515 142 481 124Q485 88 443 82Q413 58 379 104Z", "#ef93b0", { stroke: "#be5487", "stroke-width": "7" });
        path("M380 104V256M335 103Q355 133 327 153M434 98Q405 130 438 151M285 145Q328 157 302 192M476 140Q439 162 479 188M310 232Q349 214 367 249M451 225Q414 209 396 251", "none", { stroke: "#ffe1ed", "stroke-width": "8", "stroke-linecap": "round" });
        if (scene === "memory") {
          circle(540, 93, 27, "#ffcf4f");
          path("M540 52V39M540 147V134M499 93H486M594 93H581M511 64L501 54M579 132L569 122", "none", { stroke: "#edaa39", "stroke-width": "5", "stroke-linecap": "round" });
        }
      } else if (scene === "research") {
        rect(451, 82, 140, 193, "#fffdf7", { rx: "14", stroke: "#6d83a7", "stroke-width": "7" });
        rect(485, 70, 70, 25, "#91a7cb", { rx: "8" });
        for (let row = 0; row < 4; row += 1) {
          rect(475, 120 + row * 35, 16, 16, "#69b590", { rx: "4" });
          line(504, 129 + row * 35, 565, 129 + row * 35, "#7288a8", 5);
        }
        circle(256, 128, 35, "#f2bb92");
        path("M199 286Q206 185 256 185Q307 185 316 286Z", "#7b79c8");
        circle(343, 141, 28, "#e5a982");
        path("M307 286Q312 197 350 197Q390 197 394 286Z", "#53a6ad");
      } else if (scene === "senses") {
        path("M202 183Q380 42 558 183Q380 320 202 183Z", "#ffffff", { stroke: "#9865b5", "stroke-width": "12" });
        circle(380, 183, 65, "#62c5d5");
        circle(380, 183, 31, "#35486f");
        circle(367, 169, 11, "#ffffff");
      } else {
        circle(315, 130, 34, "#e5a982");
        circle(445, 130, 34, "#d99672");
        path("M247 296Q251 184 315 184Q379 184 384 296Z", palette[0]);
        path("M377 296Q381 184 445 184Q510 184 514 296Z", palette[1]);
        if (scene === "wellbeing") {
          path("M380 157Q346 125 326 156Q309 187 380 225Q451 187 434 156Q414 125 380 157Z", "#ee6478");
          line(370, 184, 385, 199, "#ffffff", 5);
          line(385, 199, 408, 170, "#ffffff", 5);
        }
      }
      break;
    default:
      path("M0 228Q180 172 380 229T760 216V360H0Z", "#77bf79");
      circle(380, 151, 72, palette[1]);
      circle(352, 136, 15, "#ffffff", { opacity: "0.55" });
  }

  rect(18, 16, 724, 47, palette[0], { rx: "15", opacity: "0.94" });
  const focusLabel = addSvgElement(svg, "text", {
    x: "38",
    y: "45",
    fill: "#ffffff",
    "font-family": "Arial, sans-serif",
    "font-size": "18",
    "font-weight": "700"
  });
  focusLabel.textContent = wrapSvgText(focus, 69, 1)[0];

  const caption = document.createElement("figcaption");
  caption.textContent = `${lesson.title} — ${focus}. ${pictureDescriptions[scene]}`;
  figure.append(svg, caption);
  return figure;
}

const pictureDescriptions = {
  cell: "A large colourful animal cell with a nucleus and smaller organelles inside its flexible membrane.",
  dna: "A bright double-helix strand with paired coloured rungs represents genetic information.",
  plant: "A green crop plant grows from rich soil beneath a bright sun, showing plant structure and its growing environment.",
  body: "A human body illustration highlights internal organs involved in the lesson topic.",
  ecosystem: "A lively Ghanaian-style landscape with trees, grassland, water, and an animal shows organisms in habitats.",
  reaction: "Colourful laboratory flasks contain different liquids and bubbles during a safe, supervised investigation.",
  atom: "A colourful atomic model shows a central nucleus and electrons around it.",
  periodic: "A correctly arranged periodic table shows all 118 elements in seven periods and 18 groups, with atomic numbers, chemical symbols, and the lanthanide and actinide series displayed below.",
  molecule: "Coloured atoms joined by bonds form a three-dimensional molecule.",
  gas: "A transparent chamber shows gas particles moving inside a container.",
  electron: "Two electrodes and moving charges represent electron transfer in a redox or electrochemical process.",
  energy: "The Sun and a changing landscape represent energy transfer and transformation.",
  instrument: "A measuring scale and instrument show careful observation of physical quantities.",
  motion: "A colourful moving vehicle and motion trails represent forces and movement.",
  thermal: "Warm and cool particles illustrate the transfer of thermal energy.",
  wave: "A bright repeating wave represents energy travelling through a medium.",
  light: "A beam of light changes direction as it meets a transparent boundary.",
  circuit: "A battery, wires, and electrical components form a complete circuit.",
  magnet: "A horseshoe electromagnet is surrounded by curved magnetic field lines.",
  crystal: "A faceted colourful mineral crystal represents the structure and properties of minerals.",
  rock: "A layered landscape shows different rocks and stages of the rock cycle.",
  soil: "A soil cross-section shows surface plants, underground layers, stones, and roots.",
  tectonic: "A cutaway landscape shows layered crust and moving tectonic plates beneath mountains.",
  water: "Clouds, rainfall, land, and flowing water illustrate movement through the water cycle.",
  climate: "Sunlight, clouds, and rainfall represent long-term climate processes.",
  mine: "A Ghanaian landscape and mine building illustrate geological resources and extraction.",
  space: "A moon and ringed planet appear against a star-filled night sky.",
  star: "Bright stars of different colours shine across a deep-space scene.",
  spectrum: "A colourful spectrum shows how light can be separated into different wavelengths.",
  comet: "An icy comet travels through space with a long glowing tail.",
  galaxy: "A spiral galaxy with a glowing centre and curved arms fills the night sky.",
  telescope: "A telescope points toward distant objects in a starry sky.",
  recycling: "Colourful arrows circle around reusable materials to represent waste reduction.",
  computer: "A computer displays program instructions on its screen.",
  binary: "Rows of bright digital tiles represent information stored in binary form.",
  database: "A computer screen displays organised rows of data records.",
  brain: "A colourful brain illustration represents neural activity and behaviour.",
  memory: "A brain and glowing idea symbol represent learning and memory.",
  research: "Learners and a checklist represent careful, ethical psychological research.",
  people: "Two people illustrate development and social interaction.",
  senses: "A colourful eye represents sensation, attention, and perception.",
  wellbeing: "People and a heart represent care, support, and mental wellbeing.",
  taxonomy: "A branching classification tree groups organisms by shared features into increasingly specific groups.",
  photosynthesis: "Sunlight reaches a leafy plant while water and gas particles enter and oxygen leaves, representing photosynthesis.",
  transport: "A plant stem cross-section shows separate vascular pathways carrying water and sugars through the plant.",
  digestion: "A simplified digestive tract shows food moving through the stomach and intestine as it is broken down and absorbed.",
  mitochondria: "A mitochondrion with folded inner membranes represents the site of many cellular respiration reactions.",
  flower: "A flower, pollen grains, leaves, and stem illustrate pollination and plant reproduction.",
  evolution: "Birds with different beak shapes illustrate inherited variation and natural selection.",
  immune: "A protective immune shield faces pathogens, representing the body's defences against infection.",
  foodweb: "Producer and consumer nodes connected by arrows represent feeding relationships in a food web.",
  "environment-foodweb": "A trophic pyramid links producers and consumers to show energy transfer through an ecosystem.",
  stoichiometry: "A balanced scale compares particle groups to represent mole ratios in a chemical equation.",
  "acid-base": "Two indicator-filled solutions and a colour scale represent acids, bases, and pH.",
  collision: "Moving reactant particles approach a collision, showing how successful collisions can form products.",
  calorimetry: "A thermometer sits in a reaction vessel to represent measuring energy transfer in calorimetry.",
  organic: "A connected carbon skeleton represents the bonds and chains found in organic molecules.",
  electrolysis: "An electrolyte bath with two electrodes shows ions moving during electrolysis.",
  "test-tubes": "Four test tubes with different reagent colours represent chemical tests used to identify substances.",
  induction: "A moving magnet beside a coil represents electromagnetic induction and induced current.",
  semiconductor: "A semiconductor chip with pins and a signal path represents electronic control of current.",
  nucleus: "A radioactive nucleus emits particles as it changes toward a more stable state.",
  "weather-cycle": "Sunlight, clouds, rainfall, and land show stages of evaporation, condensation, and precipitation.",
  "environment-climate": "Earth, sunlight, and heat-transfer arrows represent climate processes and the greenhouse effect.",
  aquifer: "A groundwater cross-section shows water stored in permeable rock and drawn from a well.",
  landslide: "A slope with displaced earth and rocks illustrates a landslide hazard.",
  eclipse: "The Moon passes between the Sun and Earth, casting a shadow during an eclipse.",
  orbit: "Planets travel along separate paths around the Sun under the influence of gravity.",
  nebula: "A colourful cloud of gas and dust represents a stellar nursery where stars can form.",
  sun: "The Sun's bright surface and magnetic activity represent the source of solar energy and space weather.",
  cosmos: "Galaxies and expanding paths represent the large-scale structure and evolution of the universe.",
  habitat: "A landscape combines shelter, water, plants, and wildlife to show the features of a habitat.",
  pollution: "Factory emissions and affected water illustrate how pollution can enter the environment.",
  "water-quality": "A water sample with test indicators represents monitoring physical and chemical water quality.",
  sustainability: "A growing leaf and circular arrows represent meeting needs while protecting resources for the future.",
  "ghana-habitats": "A Ghana-inspired landscape with woodland, grassland, water, and settlement represents local ecosystems.",
  conservation: "A protected leaf inside a shield represents conserving species and habitats.",
  algorithm: "A start, decision, and result flowchart represents the ordered steps of an algorithm.",
  string: "Character symbols inside a display represent text stored and processed as a programming string.",
  variables: "Named storage boxes represent variables holding different values in a program.",
  calculator: "A calculator keypad and display represent arithmetic operations in code.",
  code: "A code editor with structured instructions represents writing a computer program.",
  conditional: "A decision diamond branches into yes and no paths, representing a conditional statement.",
  loop: "Two curved arrows encircle an instruction, representing a repeated programming loop.",
  debugger: "A magnifying glass highlights a line in a program, representing debugging and error checking.",
  function: "An input passes through a function and produces an output, representing reusable code.",
  list: "An ordered sequence of labelled values represents a programming list.",
  web: "A browser window with content and navigation represents a web page.",
  dictionary: "Paired entries in a two-column structure represent key-value data in a programming dictionary.",
  network: "Connected nodes represent devices communicating across a computer network.",
  development: "Three people at different growth stages represent physical and psychological development over time.",
  conditioning: "A stimulus, learned response, and outcome represent the formation of an association.",
  social: "Two people exchanging a signal represent social interaction and influence.",
  personality: "A person surrounded by varied trait markers represents individual personality differences.",
  "mental-health": "A heart, supportive people, and a calm path represent wellbeing and access to mental-health support."
};

function getTeachingSections(lesson, subject) {
  const guide = subjectStudyGuides[subject.toUpperCase()] || subjectStudyGuides.BIOLOGY;
  const correctAnswer = lesson.options?.[lesson.answer ?? 0];
  return [
    {
      title: "Build the central idea",
      paragraphs: [
        lesson.intro,
        guide.lens,
        `Keep this lesson's key fact in mind: ${lesson.fact} Connect it to the main idea by asking what it helps you explain, observe, calculate, or identify.`
      ]
    },
    {
      title: "Reason from the evidence",
      paragraphs: [
        guide.method,
        `Use the lesson question as a worked check: “${lesson.question}” A suitable answer is “${correctAnswer}”. ${lesson.explanation}`,
        "To learn from the example, explain why that answer fits the question and why another possible answer would not. This small justification is more useful than memorising a letter or option position. If a question gives data, point to the observation or calculation that supports your choice."
      ]
    },
    {
      title: "Apply, investigate, and review",
      paragraphs: [
        guide.context,
        guide.practice,
        `Before moving on, summarize ${lesson.title.toLowerCase()} in your own words. Include the central idea, one supporting fact, and one example or piece of evidence. Then answer the lesson question without looking back and explain your reasoning.`
      ]
    }
  ];
}

function addReadingSection(parent, heading, paragraphs) {
  const section = document.createElement("section");
  section.className = "reading-section expanded-reading-section";
  addTextElement(section, "h2", "reading-subheading", heading);
  for (const paragraph of paragraphs) {
    addTextElement(section, "p", "reading-copy", paragraph);
  }
  parent.append(section);
  return section;
}

function loadLesson() {
  try {
    const saved = sessionStorage.getItem(READER_LESSON_KEY);
    if (!saved) {
      return null;
    }
    const selection = JSON.parse(saved);
    const lessonId = selection?.lessonId || selection?.lesson?.id;
    if (typeof lessonId !== "string") {
      throw new Error("The selected lesson identifier is missing.");
    }
    return { lessonId };
  } catch (error) {
    console.error("Could not load lesson reading material.", error);
    return null;
  }
}

function markLessonComplete(lessonId) {
  try {
    const stored = JSON.parse(localStorage.getItem(COMPLETED_LESSONS_KEY) || "[]");
    const completed = new Set(Array.isArray(stored) ? stored : []);
    completed.add(lessonId);
    localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify([...completed]));
  } catch (error) {
    console.error("Could not save lesson progress.", error);
    throw error;
  }
}

function renderMissingLesson() {
  readerCard.replaceChildren();
  addTextElement(readerCard, "p", "eyebrow", "LESSON NOT SELECTED");
  addTextElement(readerCard, "h1", "reader-title", "Choose a lesson to begin");
  addTextElement(
    readerCard,
    "p",
    "reader-intro",
    "Open a subject and select a lesson first. Its reading notes will appear here."
  );
  const link = document.createElement("a");
  link.className = "read-lesson-button";
  link.href = "index.html";
  link.textContent = "Browse lessons";
  readerCard.append(link);
}

function renderLesson(selection) {
  const { branchName, lesson } = selection;
  readerCard.replaceChildren();
  readerCard.classList.add("reader-document");

  const pages = Array.from({ length: 3 }, (_, index) => {
    const page = document.createElement("section");
    page.className = "reader-page";
    page.setAttribute("aria-label", `Lesson document page ${index + 1} of 3`);
    readerCard.append(page);
    addTextElement(page, "p", "reader-page-number", `READING PAGE ${index + 1} OF 3`);
    return page;
  });
  const [firstPage, secondPage, thirdPage] = pages;
  for (const page of [secondPage, thirdPage]) {
    const continuedHeader = document.createElement("header");
    continuedHeader.className = "reader-page-heading";
    addTextElement(continuedHeader, "p", "eyebrow", "LESSON NOTES · CONTINUED");
    addTextElement(continuedHeader, "h2", "", lesson.title);
    page.append(continuedHeader);
  }

  addTextElement(firstPage, "p", "eyebrow", "READ AND LEARN");
  const meta = document.createElement("div");
  meta.className = "lesson-meta";
  addTextElement(meta, "span", "subject-tag", branchName.toUpperCase());
  if (lesson.year) {
    addTextElement(meta, "span", "year-tag", lesson.year);
  }
  addTextElement(meta, "span", "time-tag", `◷ ${lesson.duration} read`);
  firstPage.append(meta);

  addTextElement(firstPage, "h1", "reader-title", lesson.title);
  firstPage.append(createAudioReader(pages));

  const teachingSections = getTeachingSections(lesson, branchName);

  if (lesson.learningNotes) {
    const objectivesSection = document.createElement("section");
    objectivesSection.className = "reader-section learning-objectives";
    addTextElement(objectivesSection, "p", "eyebrow", "LEARNING GOALS");
    addTextElement(objectivesSection, "h2", "", "By the end, you should be able to");
    const objectives = document.createElement("ul");
    for (const objective of lesson.learningNotes.objectives) {
      addTextElement(objectives, "li", "", objective);
    }
    objectivesSection.append(objectives);
    firstPage.append(objectivesSection);

    const termsSection = document.createElement("section");
    termsSection.className = "reader-section key-terms";
    addTextElement(termsSection, "p", "eyebrow", "KEY TERMS");
    const terms = document.createElement("dl");
    for (const [term, definition] of lesson.learningNotes.vocabulary) {
      addTextElement(terms, "dt", "", term);
      addTextElement(terms, "dd", "", definition);
    }
    termsSection.append(terms);
    firstPage.append(termsSection);

    const noteSections = lesson.learningNotes.sections;
    const sectionCount = noteSections.length;
    const firstPageEnd = Math.ceil(sectionCount / 3);
    const secondPageEnd = Math.ceil((sectionCount * 2) / 3);
    const sectionGroups = [
      noteSections.slice(0, firstPageEnd),
      noteSections.slice(firstPageEnd, secondPageEnd),
      noteSections.slice(secondPageEnd)
    ];

    for (const [pageIndex, sections] of sectionGroups.entries()) {
      const page = pages[pageIndex];
      const readingSection = document.createElement("section");
      readingSection.className = "reading-section";
      addTextElement(
        readingSection,
        "p",
        "eyebrow",
        pageIndex === 0 ? "LESSON NOTES" : "LESSON NOTES · CONTINUED"
      );
      for (const section of sections) {
        addTextElement(readingSection, "h2", "reading-subheading", section.title);
        for (const paragraph of section.body.split(/\n\s*\n/).filter(Boolean)) {
          addTextElement(readingSection, "p", "reading-copy", paragraph);
        }
        if (section.figure) {
          const figure = document.createElement("figure");
          figure.className = "reading-figure";
          const image = document.createElement("img");
          image.src = section.figure.src;
          image.alt = section.figure.alt;
          const caption = document.createElement("figcaption");
          caption.textContent = section.figure.caption;
          figure.append(image, caption);
          readingSection.append(figure);
        }
      }
      page.append(readingSection);
      const extendedSection = addReadingSection(
        page,
        teachingSections[pageIndex].title,
        teachingSections[pageIndex].paragraphs
      );
      extendedSection.append(createLessonPicture(lesson, branchName, pageIndex));
      extendedSection.append(createTopicFigure(lesson, branchName, pageIndex, 0));
      extendedSection.append(createTopicFigure(lesson, branchName, pageIndex, 1));
    }

    const example = document.createElement("aside");
    example.className = "reader-example";
    addTextElement(example, "strong", "", "WORKED EXAMPLE");
    addTextElement(example, "p", "", lesson.learningNotes.example);
    thirdPage.append(example);

    const recapSection = document.createElement("section");
    recapSection.className = "reader-section";
    addTextElement(recapSection, "p", "eyebrow", "RECAP");
    addTextElement(recapSection, "p", "reading-copy recap-copy", lesson.learningNotes.recap);
    thirdPage.append(recapSection);

    const caution = document.createElement("aside");
    caution.className = "reader-watch-out";
    addTextElement(caution, "strong", "", "COMMON MISUNDERSTANDING");
    addTextElement(caution, "p", "", lesson.learningNotes.watchOut);
    thirdPage.append(caution);
  } else {
    const objectives = document.createElement("section");
    objectives.className = "reader-section learning-objectives";
    addTextElement(objectives, "p", "eyebrow", "LEARNING GOALS");
    addTextElement(objectives, "h2", "", "By the end, you should be able to");
    const objectiveList = document.createElement("ul");
    for (const objective of [
      `Explain the central idea in ${lesson.title.toLowerCase()}.`,
      `Use the key fact to support an answer about ${lesson.title.toLowerCase()}.`,
      "Apply the lesson idea to an example and explain your reasoning."
    ]) {
      addTextElement(objectiveList, "li", "", objective);
    }
    objectives.append(objectiveList);
    firstPage.append(objectives);

    for (const [pageIndex, page] of pages.entries()) {
      const extendedSection = addReadingSection(
        page,
        teachingSections[pageIndex].title,
        teachingSections[pageIndex].paragraphs
      );
      extendedSection.append(createLessonPicture(lesson, branchName, pageIndex));
      extendedSection.append(createTopicFigure(lesson, branchName, pageIndex, 0));
      extendedSection.append(createTopicFigure(lesson, branchName, pageIndex, 1));
    }
  }

  if (lesson.code) {
    const codeSection = document.createElement("section");
    codeSection.className = "code-example reader-code";
    const heading = document.createElement("div");
    heading.className = "code-example-heading";
    addTextElement(heading, "strong", "", "CODE EXAMPLE");
    addTextElement(heading, "span", "", "PYTHON");
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = lesson.code;
    pre.append(code);
    codeSection.append(heading, pre);
    thirdPage.append(codeSection);
  }

  const nextPage = document.createElement("a");
  nextPage.className = "read-lesson-button";
  nextPage.href = "quiz.html";
  nextPage.textContent = "Finish reading and continue to quiz →";
  thirdPage.append(nextPage);

  const back = document.createElement("a");
  back.className = "reader-return";
  back.href = "index.html";
  back.textContent = "← Return to subjects and lessons";
  thirdPage.append(back);

  const wordCount = pages
    .map((page) => page.innerText.trim().split(/\s+/).filter(Boolean).length)
    .reduce((total, count) => total + count, 0);
  meta.querySelector(".time-tag").textContent = `◷ ${Math.max(6, Math.ceil(wordCount / 180))} min read`;
}

const lessonSelection = loadLesson();
if (lessonSelection) {
  const lessonRequest = isPublicDemo
    ? fetch("curriculum.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("The public lesson catalogue could not be loaded.");
        }
        return response.json();
      })
      .then((catalogue) => {
        for (const branch of catalogue.branches) {
          const lesson = branch.lessons.find((item) => item.id === lessonSelection.lessonId);
          if (lesson) {
            return { branchName: branch.name, lesson };
          }
        }
        throw new Error("The selected lesson could not be found.");
      })
    : fetch(`/api/lessons/${encodeURIComponent(lessonSelection.lessonId)}/content`, {
      credentials: "same-origin"
    })
    .then(async (response) => {
      let result;
      try {
        result = await response.json();
      } catch (error) {
        console.error("The lesson-access response could not be read.", error);
        throw new Error("The server returned an unreadable access response.");
      }
      if (!response.ok) {
        const accessError = new Error(result.error?.message || "Lesson access could not be checked.");
        accessError.code = result.error?.code;
        throw accessError;
      }
      return result;
    });
  lessonRequest
    .then((selection) => renderLesson(selection))
    .catch((error) => {
      console.error("Could not confirm lesson access.", error);
      readerCard.replaceChildren();
      const locked = error.code === "LESSON_LOCKED";
      addTextElement(readerCard, "p", "eyebrow", locked ? "LESSON LOCKED" : "LESSON ACCESS");
      addTextElement(
        readerCard,
        "h1",
        "reader-title",
        locked ? "Unlock this lesson to read" : "Could not verify lesson access"
      );
      addTextElement(
        readerCard,
        "p",
        "reader-intro",
        locked
          ? "Use 1 credit to unlock this lesson from your learning path. Once unlocked, you can return to it anytime."
          : `${error.message} Run CURIOUSBOOSTER using npm start and open http://localhost:3000.`
      );
      const link = document.createElement("a");
      link.className = "read-lesson-button";
      link.href = "index.html";
      link.textContent = "Return to CURIOUSBOOSTER";
      readerCard.append(link);
    });
} else {
  renderMissingLesson();
}
