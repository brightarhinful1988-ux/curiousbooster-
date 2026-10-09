function makeLesson(id, year, title, intro, fact, question, options, explanation, code = null) {
  return {
    id,
    year,
    title,
    duration: "6 min",
    intro,
    fact,
    question,
    options,
    answer: 0,
    explanation,
    code
  };
}

const branches = [
  {
    id: "biology",
    name: "Biology",
    icon: "🧬",
    summary: "Ghana SHS biology topics across Year 1, Year 2, and Year 3",
    lessons: [
      makeLesson("biology-cells", "Year 1", "Cells and specialised tissues",
        "Cells are the basic structural and functional units of living organisms. In multicellular organisms, cells become specialised for particular roles and work together in tissues and organs.",
        "A red blood cell's shape helps it carry oxygen efficiently.",
        "What is a tissue?",
        ["A group of similar cells working together", "A single organ system", "A group of unrelated ecosystems"],
        "A tissue is a group of similar cells that work together to perform a function."),
      makeLesson("biology-classification", "Year 1", "Classification and biodiversity",
        "Biologists classify organisms by shared characteristics, helping us identify and study the diversity of life. Scientific names provide a consistent way to identify species across languages and regions.",
        "In binomial naming, the first word is the genus and the second identifies the species.",
        "Why do scientists use a shared classification system?",
        ["To organise organisms and communicate about them consistently", "To show that all organisms are identical", "To decide where organisms live"],
        "Classification organises the diversity of organisms and gives scientists a consistent way to identify and compare them."),
      makeLesson("biology-photosynthesis", "Year 1", "Plant nutrition and photosynthesis",
        "Green plants make organic food through photosynthesis. Using light energy captured by chlorophyll, plants convert carbon dioxide and water into glucose, releasing oxygen.",
        "Photosynthesis supports crop growth, including important Ghanaian crops such as maize and cassava.",
        "Which raw materials are used in photosynthesis?",
        ["Carbon dioxide and water", "Oxygen and protein", "Nitrogen and glucose"],
        "Plants use carbon dioxide and water, with light energy, to make glucose during photosynthesis."),
      makeLesson("biology-transport", "Year 1", "Transport in plants and animals",
        "Organisms need transport systems to move materials around the body. In plants, xylem carries water and mineral salts from roots, while phloem transports sugars to places where they are used or stored.",
        "Transpiration is the loss of water vapour from plant leaves, mainly through stomata.",
        "Which plant tissue transports water from the roots?",
        ["Xylem", "Phloem", "Epidermis"],
        "Xylem vessels transport water and mineral salts from the roots through the plant."),
      makeLesson("biology-genetics", "Year 2", "Inheritance and genetic variation",
        "Genes are sections of DNA that can influence inherited characteristics. During reproduction, offspring receive genetic information from their parents, creating similarities as well as variation.",
        "Different forms of the same gene are called alleles.",
        "What is an allele?",
        ["An alternative form of a gene", "A type of body tissue", "A whole chromosome set"],
        "Alleles are alternative forms of a gene that can contribute to variation."),
      makeLesson("biology-nutrition", "Year 2", "Human nutrition and digestion",
        "A balanced diet supplies nutrients needed for energy, growth, and health. Digestion breaks large, insoluble food molecules into smaller, soluble molecules that can be absorbed into the blood.",
        "The small intestine has a large surface area for absorbing digested nutrients.",
        "What is the main purpose of digestion?",
        ["To break large food molecules into absorbable molecules", "To make food move into the lungs", "To turn all nutrients into water"],
        "Digestion makes large food molecules small and soluble enough to be absorbed."),
      makeLesson("biology-respiration", "Year 2", "Cellular respiration and energy",
        "Cellular respiration releases energy from glucose inside cells. Aerobic respiration uses oxygen and produces carbon dioxide and water; cells use the released energy for their activities.",
        "Respiration happens in living cells; breathing moves air into and out of the lungs.",
        "Which gas is used in aerobic respiration?",
        ["Oxygen", "Nitrogen", "Helium"],
        "Aerobic respiration uses oxygen to release energy from glucose."),
      makeLesson("biology-reproduction", "Year 2", "Reproduction and life cycles",
        "Reproduction produces offspring and passes genetic information to the next generation. In flowering plants, pollination transfers pollen to a stigma; after fertilisation, seeds can develop.",
        "Pollination is the transfer of pollen, while fertilisation is the fusion of gamete nuclei.",
        "What is pollination?",
        ["The transfer of pollen to a stigma", "The germination of a seed", "The fusion of two seeds"],
        "Pollination transfers pollen grains to a flower's stigma."),
      makeLesson("biology-evolution", "Year 3", "Evolution by natural selection",
        "Individuals in a population vary. If a heritable trait helps organisms survive and reproduce in a particular environment, that trait may become more common over generations.",
        "Natural selection acts on individuals, while populations evolve as inherited traits change in frequency.",
        "What can happen to a helpful inherited trait over many generations?",
        ["It may become more common in the population", "It instantly appears in every individual", "It always disappears"],
        "Organisms with a helpful heritable trait may leave more offspring, increasing that trait's frequency over generations."),
      makeLesson("biology-disease", "Year 3", "Microorganisms, disease, and immunity",
        "Some microorganisms cause infectious diseases, while many others are harmless or useful. The body's immune system recognises pathogens and helps defend against infection; vaccines train immune responses against particular pathogens.",
        "Malaria is caused by Plasmodium parasites and is transmitted to people by infected female Anopheles mosquitoes.",
        "What is the role of a vaccine?",
        ["To help the immune system recognise a pathogen", "To act as a nutrient for bacteria", "To replace all white blood cells"],
        "Vaccines prepare the immune system to recognise and respond to a specific pathogen."),
      makeLesson("biology-ecology", "Year 3", "Ecology, food webs, and conservation",
        "Ecology studies how organisms interact with one another and their environment. Food webs show how energy moves through ecosystems, while conservation aims to protect species, habitats, and biodiversity.",
        "Protecting habitats, including Ghana's forests and coastal wetlands, can support many species at once.",
        "What does a food web show?",
        ["Feeding relationships and energy pathways in an ecosystem", "The structure of one animal's bones", "The stages of a rock cycle"],
        "A food web links feeding relationships and shows how energy can move through an ecosystem.")
    ]
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "⚗️",
    summary: "13 lessons across Year 1, Year 2, and Year 3",
    lessons: [
      {
        id: "chemistry",
        year: "Year 1",
        title: "Chemical reactions conserve atoms",
        duration: "6 min",
        intro:
          "In a chemical reaction, atoms are rearranged as old bonds break and new bonds form. The atoms themselves are conserved, even though the substances they make can change.",
        fact: "A balanced chemical equation has the same number of each kind of atom on both sides.",
        question: "What happens to atoms during an ordinary chemical reaction?",
        options: [
          "They are rearranged into new combinations",
          "They vanish to release energy",
          "They change into a different element"
        ],
        answer: 0,
        explanation:
          "Chemical reactions rearrange atoms; they do not turn one element's atoms into another element."
      },
      {
        id: "chemistry-atomic-structure",
        year: "Year 1",
        title: "Atomic structure and isotopes",
        duration: "7 min",
        intro:
          "Atoms contain protons and neutrons in a nucleus, with electrons around it. The number of protons identifies an element. Isotopes of the same element have the same proton number but different neutron numbers.",
        fact: "In a neutral atom, the number of electrons equals the number of protons.",
        question: "What is different between isotopes of the same element?",
        options: ["Their number of neutrons", "Their number of protons", "Their chemical symbol"],
        answer: 0,
        explanation:
          "Isotopes share a proton number but have different numbers of neutrons."
      },
      {
        id: "chemistry-periodic-table",
        year: "Year 1",
        title: "The periodic table and trends",
        duration: "7 min",
        intro:
          "Elements are arranged in order of increasing proton number. Their positions show repeating patterns in properties. Elements in the same group have related outer-electron arrangements and often react in similar ways.",
        fact: "Across a period, proton number increases by one from one element to the next.",
        question: "Why do elements in the same group often have similar chemical properties?",
        options: [
          "They have similar outer-electron arrangements",
          "They all have the same mass number",
          "They contain the same number of neutrons"
        ],
        answer: 0,
        explanation:
          "Outer electrons take part in bonding and reactions, so similar outer-electron arrangements lead to similar chemistry."
      },
      {
        id: "chemistry-bonding",
        year: "Year 1",
        title: "Ionic and covalent bonding",
        duration: "7 min",
        intro:
          "Ionic bonding involves attraction between oppositely charged ions, often after electrons transfer from one atom to another. Covalent bonding happens when atoms share pairs of electrons.",
        fact: "Sodium chloride is an ionic compound made of sodium ions and chloride ions in a giant lattice.",
        question: "What happens to electrons in a covalent bond?",
        options: ["They are shared between atoms", "They are destroyed", "They become protons"],
        answer: 0,
        explanation:
          "Covalent bonds form when atoms share pairs of electrons."
      },
      {
        id: "chemistry-moles",
        year: "Year 1",
        title: "The mole and chemical calculations",
        duration: "8 min",
        intro:
          "Chemists use the mole to count enormous numbers of particles. In a balanced equation, the coefficients give mole ratios that help calculate how much reactant is needed or product can form.",
        fact: "One mole contains approximately 6.02 × 10²³ specified particles.",
        question: "In a balanced equation, what do the coefficients show?",
        options: [
          "The relative amounts in moles",
          "The colours of the substances",
          "The temperature of the reaction"
        ],
        answer: 0,
        explanation:
          "Balanced-equation coefficients provide the stoichiometric mole ratios between substances."
      },
      {
        id: "chemistry-gases",
        year: "Year 2",
        title: "Gas volume and the ideal gas relationship",
        duration: "7 min",
        intro:
          "Gas particles move randomly and spread out to fill their container. Changing temperature, pressure, or volume changes how the particles collide. At a fixed temperature, compressing a gas into less volume increases its pressure.",
        fact: "For a fixed amount of gas at constant temperature, pressure and volume are inversely related.",
        question: "If a gas is compressed at constant temperature, what happens to its pressure?",
        options: ["It increases", "It decreases to zero", "It never changes"],
        answer: 0,
        explanation:
          "The particles collide with the container walls more often per unit area when the gas occupies less volume."
      },
      {
        id: "chemistry-acids",
        year: "Year 2",
        title: "Acids, bases, and salts",
        duration: "7 min",
        intro:
          "Acids produce hydrogen ions in aqueous solution, while alkalis produce hydroxide ions. Neutralisation occurs when acid and base react; acid-base reactions can produce a salt and water.",
        fact: "A solution with pH 7 is neutral at about 25 °C; lower pH is acidic and higher pH is alkaline.",
        question: "Which products are formed when an acid neutralises an alkali?",
        options: ["A salt and water", "Oxygen and hydrogen", "Only carbon dioxide"],
        answer: 0,
        explanation:
          "Neutralisation between an acid and an alkali forms a salt and water."
      },
      {
        id: "chemistry-redox",
        year: "Year 2",
        title: "Oxidation and reduction",
        duration: "7 min",
        intro:
          "Redox reactions involve electron transfer. Oxidation is loss of electrons, while reduction is gain of electrons. Both processes happen together because electrons lost by one species are gained by another.",
        fact: "A useful memory aid is OIL RIG: Oxidation Is Loss, Reduction Is Gain (of electrons).",
        question: "What happens to a species that is reduced?",
        options: ["It gains electrons", "It loses electrons", "It loses all its protons"],
        answer: 0,
        explanation:
          "Reduction is the gain of electrons."
      },
      {
        id: "chemistry-rates-equilibrium",
        year: "Year 3",
        title: "Rates of reaction and equilibrium",
        duration: "8 min",
        intro:
          "Reaction rate describes how quickly reactants are used or products form. In a reversible reaction in a closed system, dynamic equilibrium is reached when forward and reverse reactions continue at equal rates.",
        fact: "Increasing temperature often increases reaction rate because more particles have enough energy to react when they collide.",
        question: "At dynamic equilibrium, how do the forward and reverse reaction rates compare?",
        options: ["They are equal", "The forward rate is always zero", "The reverse reaction stops"],
        answer: 0,
        explanation:
          "Both reactions continue, but at equal rates, so concentrations remain constant."
      },
      {
        id: "chemistry-energetics",
        year: "Year 2",
        title: "Energy changes in chemical reactions",
        duration: "7 min",
        intro:
          "Chemical reactions involve energy changes as bonds break and form. Breaking bonds takes in energy; forming bonds releases energy. A reaction is exothermic if it releases more energy than it absorbs overall.",
        fact: "Combustion of fuels is a common exothermic process used to provide heat.",
        question: "What happens overall in an exothermic reaction?",
        options: ["Energy is transferred to the surroundings", "Energy is created from nothing", "All bonds stop moving"],
        answer: 0,
        explanation:
          "An exothermic reaction releases energy to its surroundings, often warming them."
      },
      {
        id: "chemistry-organic",
        year: "Year 3",
        title: "Introduction to organic chemistry",
        duration: "8 min",
        intro:
          "Organic chemistry studies carbon compounds. Hydrocarbons contain only carbon and hydrogen. Alkanes are saturated hydrocarbons with single carbon-carbon bonds; alkenes contain at least one carbon-carbon double bond.",
        fact: "Ethanol is an alcohol used as a solvent and fuel; it is also produced during fermentation of sugars.",
        question: "Which feature identifies an alkene?",
        options: [
          "At least one carbon-carbon double bond",
          "Only single bonds between carbon atoms",
          "No carbon atoms"
        ],
        answer: 0,
        explanation:
          "Alkenes are unsaturated hydrocarbons containing at least one carbon-carbon double bond."
      },
      {
        id: "chemistry-electrolysis",
        year: "Year 3",
        title: "Electrolysis and electrochemical cells",
        duration: "8 min",
        intro:
          "Electrolysis uses electrical energy to drive a non-spontaneous chemical change in an electrolyte. Positive ions move toward the negative electrode, while negative ions move toward the positive electrode.",
        fact: "Electrolysis is used in metal extraction and in coating objects with a thin layer of metal.",
        question: "Where do positive ions move during electrolysis?",
        options: ["Toward the negative electrode", "Toward the positive electrode", "They do not move"],
        answer: 0,
        explanation:
          "Oppositely charged electrodes attract ions, so positive ions move toward the negative electrode (cathode)."
      },
      {
        id: "chemistry-analysis",
        year: "Year 3",
        title: "Qualitative analysis and chemical tests",
        duration: "7 min",
        intro:
          "Qualitative analysis helps identify substances using observations and chemical tests. A methodical test can identify gases, ions, and functional groups from evidence such as colour changes or precipitates.",
        fact: "Carbon dioxide turns limewater milky because a white calcium carbonate precipitate forms.",
        question: "What observation is a positive test for carbon dioxide with limewater?",
        options: ["The limewater turns milky", "The limewater turns blue", "A glowing splint relights"],
        answer: 0,
        explanation:
          "Carbon dioxide reacts with limewater to form insoluble calcium carbonate, making it appear milky."
      }
    ]
  },
  {
    id: "physics",
    name: "Physics",
    icon: "⚡",
    summary: "Ghana SHS physics topics across Year 1, Year 2, and Year 3",
    lessons: [
      makeLesson("physics-measurement", "Year 1", "Physical quantities and measurement",
        "Physics uses measurements to describe the natural world. A physical quantity is recorded with a number and a unit, and measurements should be made with suitable instruments and attention to uncertainty.",
        "The SI unit of length is the metre (m), and the SI unit of time is the second (s).",
        "How should a measured physical quantity be reported?",
        ["With a numerical value and a unit", "With a number only in every case", "With the instrument name only"],
        "A measurement needs both a numerical value and an appropriate unit."),
      makeLesson("physics-motion", "Year 1", "Motion, forces, and Newton's laws",
        "A force is a push or pull. When the forces on an object are unbalanced, its velocity changes: it may speed up, slow down, or change direction.",
        "Newton's second law relates net force, mass, and acceleration: F = ma.",
        "What happens when an unbalanced net force acts on an object?",
        ["Its motion changes through acceleration", "Its mass always disappears", "It must stop immediately"],
        "A nonzero net force causes acceleration, which means a change in velocity."),
      makeLesson("physics-energy", "Year 1", "Work, energy, and power",
        "Work is done when a force causes displacement in its direction. Energy is transferred during work, while power describes how quickly work is done or energy is transferred.",
        "For a constant force in the direction of motion, work done equals force multiplied by distance.",
        "What does power measure?",
        ["The rate of doing work or transferring energy", "The total distance travelled", "The amount of matter in an object"],
        "Power is the rate at which work is done or energy is transferred."),
      makeLesson("physics-thermal", "Year 1", "Heat, temperature, and thermal energy",
        "Temperature is related to the average kinetic energy of particles, while heating transfers energy between objects because of a temperature difference. Substances expand or change state as their thermal energy changes.",
        "Heat naturally flows from a hotter region to a cooler region.",
        "What is the usual direction of heat transfer?",
        ["From a hotter region to a cooler region", "From a cooler region to a hotter region without input", "Only through empty space"],
        "Thermal energy transfers spontaneously from higher to lower temperature."),
      makeLesson("physics-waves", "Year 2", "Waves and sound",
        "Waves transfer energy from place to place without a net transfer of matter. Sound is a mechanical wave that needs a medium, while light can travel through a vacuum.",
        "The frequency of a wave is the number of complete cycles passing a point each second.",
        "Which statement about sound is correct?",
        ["It needs a medium to travel", "It travels through a vacuum like light", "It transfers matter from source to listener"],
        "Sound is a mechanical vibration and needs particles in a medium to travel."),
      makeLesson("physics-optics", "Year 2", "Light, reflection, and refraction",
        "Light travels in straight lines through a uniform medium. Reflection occurs when light bounces from a surface, while refraction is a change in direction as light moves between materials at different speeds.",
        "A converging lens can bring parallel light rays together at a focal point.",
        "Why does light refract when it enters a different material?",
        ["Its speed changes", "It becomes sound", "Its frequency must become zero"],
        "A change in light's speed at a boundary causes its direction to change, except when it enters along the normal."),
      makeLesson("physics-electricity", "Year 2", "Electric circuits and resistance",
        "An electric current is the rate of flow of charge. In a simple circuit, a potential difference drives charge around a complete conducting path, while resistance opposes the current.",
        "For an ohmic conductor at constant temperature, voltage equals current multiplied by resistance (V = IR).",
        "What is needed for a steady current in a simple circuit?",
        ["A complete conducting path and a potential difference", "An open switch and no power source", "A plastic path with no charge"],
        "A complete circuit and potential difference allow charge to flow."),
      makeLesson("physics-magnetism", "Year 2", "Magnetic fields and electromagnets",
        "A magnetic field describes the magnetic influence around a magnet or current-carrying conductor. A coil carrying current can produce a magnetic field, and adding a soft iron core can make an electromagnet stronger.",
        "Reversing the current in a coil reverses the direction of its magnetic field.",
        "How can an electromagnet be made stronger?",
        ["Increase the current through its coil", "Remove all turns from the coil", "Use a non-magnetic core and no current"],
        "Increasing the current, adding turns, or using a suitable iron core can strengthen an electromagnet."),
      makeLesson("physics-induction", "Year 3", "Electromagnetic induction",
        "When the magnetic field through a conductor changes, an electromotive force can be induced. If the circuit is complete, this can produce an induced current.",
        "Generators use electromagnetic induction to convert mechanical energy into electrical energy.",
        "What can induce an electromotive force in a coil?",
        ["A changing magnetic field through the coil", "A stationary coil in an unchanging field only", "Removing every charge from the wire"],
        "A changing magnetic flux through the coil induces an electromotive force."),
      makeLesson("physics-electronics", "Year 3", "Semiconductors and electronic systems",
        "Electronic systems use components to control electrical signals. Semiconductors, such as silicon, can be used to make diodes and transistors, which are important in circuits and digital devices.",
        "A diode is designed to allow current to flow much more easily in one direction than the other.",
        "What is a typical property of a diode?",
        ["It allows current mainly in one direction", "It stores all electrical energy permanently", "It always blocks current in both directions"],
        "A diode conducts mainly in its forward direction and resists current in the reverse direction."),
      makeLesson("physics-nuclear", "Year 3", "Atomic nuclei and radioactivity",
        "Some atomic nuclei are unstable and spontaneously emit radiation as they change. Alpha, beta, and gamma radiation differ in their properties and how strongly they penetrate matter.",
        "Half-life is the time taken for half the unstable nuclei in a sample to decay.",
        "What happens to the number of undecayed nuclei after one half-life?",
        ["It falls to about half its original number", "It doubles", "It becomes zero immediately"],
        "After one half-life, about half of the original unstable nuclei remain undecayed.")
    ]
  },
  {
    id: "earth-science",
    name: "Earth Science",
    icon: "🌋",
    summary: "Ghana SHS Earth Science topics across Year 1, Year 2, and Year 3",
    lessons: [
      makeLesson("earth-minerals", "Year 1", "Minerals and their properties",
        "Minerals are naturally occurring substances with characteristic compositions and properties. Geologists identify minerals by observing features such as hardness, lustre, streak, cleavage, and crystal form.",
        "Mohs hardness compares a mineral's resistance to scratching with a scale of reference minerals.",
        "Which property describes how a mineral reflects light?",
        ["Lustre", "Streak", "Cleavage"],
        "Lustre describes the way light reflects from a mineral's surface."),
      makeLesson("earth-rock-cycle", "Year 1", "Minerals and the rock cycle",
        "Rocks are made of minerals and are continually changed by geological processes. Igneous, sedimentary, and metamorphic rocks form under different conditions and can transform from one type to another.",
        "Magma or lava cools and solidifies to form igneous rock.",
        "How does igneous rock form?",
        ["When molten rock cools and solidifies", "When sediment is compacted only", "When water evaporates from oceans"],
        "Igneous rocks form when magma or lava cools and solidifies."),
      makeLesson("earth-soils", "Year 1", "Soil formation and conservation",
        "Soil forms over time from weathered rock mixed with organic matter, water, air, and living organisms. Soil supports plant growth and stores water, but erosion can remove fertile topsoil.",
        "Plant cover and contour farming can help reduce soil erosion on slopes.",
        "Which practice can help reduce soil erosion?",
        ["Maintaining vegetation cover", "Removing all plants from slopes", "Leaving bare soil exposed to heavy rain"],
        "Vegetation helps protect soil from being carried away by wind and water."),
      makeLesson("earth-plates", "Year 2", "Plate tectonics and Earth's surface",
        "Earth's lithosphere is divided into plates that move slowly over the warmer, softer mantle beneath. Their interactions help shape mountains, ocean basins, earthquakes, and volcanoes.",
        "Many earthquakes and volcanoes occur near plate boundaries.",
        "What is Earth's outer rigid shell divided into?",
        ["Tectonic plates", "Cloud bands", "Ocean currents"],
        "Earth's lithosphere is divided into tectonic plates that move over geological time."),
      makeLesson("earth-weather", "Year 2", "Weather systems and the water cycle",
        "Weather is shaped by the movement of air and water and by energy from the Sun. In the water cycle, water evaporates, condenses into clouds, and returns to the surface as precipitation.",
        "Warm, moist air rising and cooling can lead to cloud formation and rainfall.",
        "What process changes water vapour into tiny liquid droplets?",
        ["Condensation", "Evaporation", "Erosion"],
        "Condensation occurs when water vapour cools and changes into liquid droplets."),
      makeLesson("earth-groundwater", "Year 2", "Rivers, groundwater, and water resources",
        "Water moves across the land as surface runoff and through the ground as groundwater. Permeable rocks can store and transmit groundwater in aquifers, which may supply wells and springs.",
        "Protecting catchments from pollution helps maintain water quality downstream.",
        "What is an aquifer?",
        ["A rock or sediment layer that stores and transmits groundwater", "A cloud that produces hail", "A type of volcanic ash"],
        "Aquifers are underground layers that can hold and transmit groundwater."),
      makeLesson("earth-resources", "Year 3", "Ghana's geological resources",
        "Ghana has important mineral resources, including gold, bauxite, manganese, and diamonds. Geological resources can support livelihoods and development, while responsible extraction helps reduce environmental and community impacts.",
        "Mining can alter landscapes and water systems, so rehabilitation and environmental monitoring matter.",
        "What is one important consideration in responsible mining?",
        ["Managing environmental impacts and rehabilitating affected land", "Ignoring water quality", "Mining without planning or monitoring"],
        "Responsible mining includes impact management, monitoring, and rehabilitation of affected areas."),
      makeLesson("earth-hazards", "Year 3", "Geological hazards and risk reduction",
        "Earthquakes, landslides, floods, and volcanic activity are natural hazards. Risk depends not only on the hazard itself but also on exposure and vulnerability; planning and early warnings can reduce harm.",
        "Avoiding construction on unstable slopes can reduce landslide risk.",
        "Which action can reduce landslide risk?",
        ["Planning development away from unstable slopes", "Removing slope vegetation without assessment", "Blocking all drainage channels"],
        "Careful land-use planning and slope management can reduce exposure to landslide hazards."),
      makeLesson("earth-climate", "Year 3", "Weather, climate, and climate change",
        "Weather describes short-term atmospheric conditions, while climate describes long-term patterns. Greenhouse gases absorb and re-emit infrared radiation, influencing Earth's energy balance.",
        "Water vapour, carbon dioxide, and methane are greenhouse gases.",
        "What does climate describe?",
        ["Long-term patterns of atmospheric conditions", "The weather in one hour", "Only the temperature inside a house"],
        "Climate refers to long-term patterns and averages of weather in a region.")
    ]
  },
  {
    id: "space-science",
    name: "Space Science",
    icon: "🪐",
    summary: "Space Science topics across Year 1, Year 2, and Year 3",
    lessons: [
      makeLesson("space-earth-moon", "Year 1", "Earth, the Moon, and eclipses",
        "Earth rotates once about its axis each day, producing day and night. The Moon orbits Earth, and the changing positions of the Sun, Earth, and Moon can produce eclipses.",
        "The Moon shines by reflecting sunlight; it does not produce its own visible light.",
        "What causes the Moon to appear bright in the night sky?",
        ["It reflects light from the Sun", "It makes sunlight in its core", "It reflects light from Earth's oceans only"],
        "The Moon appears bright because sunlight reflects from its surface toward Earth."),
      makeLesson("space-solar-system", "Year 1", "The solar system and planetary orbits",
        "The Sun's gravity and a planet's forward motion combine to create an orbit. Planets travel around the Sun at different distances and orbital periods.",
        "Earth takes about one year to complete one orbit around the Sun.",
        "What helps keep planets in orbit around the Sun?",
        ["Gravity and the planets' forward motion", "Air currents in space", "The light from distant stars"],
        "The Sun's gravity bends each planet's path while its forward motion carries it along its orbit."),
      makeLesson("space-observations", "Year 1", "Observing the sky and using telescopes",
        "Astronomers observe light and other signals from space using telescopes. Different telescopes detect different parts of the electromagnetic spectrum, and observations can be made from Earth or from space.",
        "A telescope gathers more light than the unaided eye, helping astronomers study faint or distant objects.",
        "Why do astronomers use telescopes?",
        ["To collect and study light from celestial objects", "To make planets produce light", "To change the distance between stars"],
        "Telescopes collect light and other signals so astronomers can study objects that are faint or far away."),
      makeLesson("space-stars", "Year 2", "Stars and stellar life cycles",
        "Stars form from clouds of gas and dust. Gravity pulls material together until conditions in the core allow nuclear fusion, which releases energy and light.",
        "Our Sun is a star that produces energy by fusing hydrogen into helium in its core.",
        "What process produces most of a star's energy?",
        ["Nuclear fusion in its core", "Burning oxygen like a candle", "Reflected light from planets"],
        "Stars produce energy through nuclear fusion in their cores."),
      makeLesson("space-sun", "Year 2", "The Sun and solar activity",
        "The Sun is a star made mostly of hydrogen and helium. Its energy comes from nuclear fusion in its core, while activity such as sunspots and solar flares is associated with changing magnetic fields.",
        "Solar activity can affect satellites, radio communication, and power systems on Earth.",
        "Where does the Sun produce most of its energy?",
        ["Through nuclear fusion in its core", "By burning coal on its surface", "By reflecting light from Earth"],
        "The Sun releases energy as hydrogen nuclei fuse into helium in its core."),
      makeLesson("space-spectra", "Year 2", "Light, spectra, and what stars are made of",
        "Light from stars can be separated into a spectrum. Patterns of dark or bright lines reveal which elements are present and can provide information about temperature and motion.",
        "Each chemical element has a characteristic pattern of spectral lines.",
        "What can a star's spectrum help astronomers identify?",
        ["Elements in the star's atmosphere", "The exact number of planets in every galaxy", "The star's age with no other evidence"],
        "Elements absorb or emit particular wavelengths, leaving characteristic spectral patterns."),
      makeLesson("space-solar-system-bodies", "Year 3", "Comets, asteroids, and small bodies",
        "The solar system contains more than planets. Asteroids are rocky or metallic bodies, while comets contain ice and dust and can form glowing comas and tails when they approach the Sun.",
        "A comet's tail is pushed away from the Sun by sunlight and the solar wind.",
        "What commonly happens to a comet as it approaches the Sun?",
        ["Its ice releases gas and dust, forming a coma and tail", "It becomes a star", "It stops orbiting"],
        "Solar heating causes a comet to release gas and dust, forming a coma and often a tail."),
      makeLesson("space-galaxies", "Year 3", "Galaxies and the expanding universe",
        "Galaxies contain stars, gas, dust, and dark matter held together by gravity. Observations of distant galaxies show that, on large scales, the universe is expanding.",
        "The Milky Way is the galaxy that contains our solar system.",
        "In which galaxy is our solar system located?",
        ["The Milky Way", "Andromeda", "The Orion Nebula"],
        "Our solar system is part of the Milky Way galaxy."),
      makeLesson("space-cosmology", "Year 3", "Evidence for the history of the universe",
        "Scientists study the history of the universe using evidence such as galaxy redshifts and the cosmic microwave background. These observations support a universe that has expanded and cooled over time.",
        "The cosmic microwave background is faint radiation detected in every direction across the sky.",
        "What does the cosmic microwave background provide evidence about?",
        ["The early history of the universe", "The daily weather on Earth", "The composition of Earth's inner core"],
        "The cosmic microwave background is evidence left over from the hot, dense early universe.")
    ]
  },
  {
    id: "environmental-science",
    name: "Environmental Science",
    icon: "🌿",
    summary: "Ghana-focused environmental topics across Year 1, Year 2, and Year 3",
    lessons: [
      makeLesson("environment-ecosystems", "Year 1", "Ecosystems and biodiversity",
        "An ecosystem includes organisms interacting with one another and with their physical environment. Biodiversity describes the variety of life, and organisms play different roles in ecosystem processes.",
        "Pollinators, decomposers, and producers each support ecosystem functions in different ways.",
        "What does biodiversity describe?",
        ["The variety of living things", "The age of the oldest rock", "The daily temperature"],
        "Biodiversity is the variety of life, including variation within species and ecosystems."),
      makeLesson("environment-habitats", "Year 1", "Habitats, populations, and communities",
        "A habitat is the place where an organism lives. A population is a group of the same species in an area, while a community includes populations of different species living and interacting there.",
        "A pond can support a community of plants, insects, fish, and microorganisms.",
        "What is a community in ecology?",
        ["Populations of different species living and interacting in an area", "One individual organism", "All the non-living parts of Earth"],
        "A community consists of populations of different species in the same area."),
      makeLesson("environment-food-webs", "Year 1", "Food chains, food webs, and energy",
        "Energy enters most ecosystems through sunlight captured by producers. Consumers obtain energy by eating plants or other organisms, and decomposers break down dead material and recycle nutrients.",
        "Energy is transferred through food webs, but some is dissipated as heat at each step.",
        "What is the role of a producer in a food chain?",
        ["To make organic food, usually using sunlight", "To eat every consumer", "To turn heat back into sunlight"],
        "Producers, such as green plants, make organic food and provide energy to other organisms."),
      makeLesson("environment-pollution", "Year 2", "Pollution and its effects",
        "Pollution occurs when harmful substances or forms of energy enter the environment. Air, water, and soil pollution can affect organisms, ecosystems, and human health.",
        "Reducing pollution at its source can prevent harm more effectively than cleaning it up later.",
        "Which action helps prevent pollution at its source?",
        ["Reducing waste before it is produced", "Dumping waste into a river", "Burning more untreated rubbish"],
        "Reducing waste and emissions before they enter the environment prevents pollution at its source."),
      makeLesson("environment-waste", "Year 2", "Waste management and the circular economy",
        "Waste can be reduced by refusing unnecessary items, reusing products, and recycling suitable materials. Safe collection and disposal help prevent waste from contaminating soil, waterways, and communities.",
        "Separating recyclable materials from general waste makes recovery and recycling more effective.",
        "Which action best follows the waste-reduction hierarchy?",
        ["Avoid creating unnecessary waste in the first place", "Burn mixed rubbish in the open", "Dump rubbish into a drain"],
        "Preventing waste is generally preferable to managing it after it has been created."),
      makeLesson("environment-water-quality", "Year 2", "Water resources and water quality",
        "Fresh water is needed by people and ecosystems. Runoff from farms, homes, and industry can carry pollutants into rivers and lakes, so catchment protection and water-quality monitoring are important.",
        "Excess nutrients entering water can cause algal blooms and reduce dissolved oxygen.",
        "What can happen when too many nutrients enter a lake?",
        ["Algal growth can increase and oxygen levels can fall", "The water becomes pure distilled water", "All pollutants disappear immediately"],
        "Excess nutrients can cause algal blooms; decomposition then uses oxygen and can harm aquatic life."),
      makeLesson("environment-sustainability", "Year 3", "Sustainable resource management",
        "Sustainability means meeting present needs while maintaining the ability of future generations to meet theirs. It involves balancing environmental health, social wellbeing, and economic activity.",
        "Renewable resources can replenish naturally, but they still need careful management if they are used faster than they recover.",
        "What is a key aim of sustainable resource use?",
        ["Meet needs while protecting future availability", "Use every resource as quickly as possible", "Ignore impacts on ecosystems"],
        "Sustainable use avoids exhausting resources and considers future generations and environmental effects."),
      makeLesson("environment-ghana-ecosystems", "Year 3", "Ghana's forests, wetlands, and coastal ecosystems",
        "Ghana includes diverse ecosystems, from forests and savannah to lagoons, mangroves, and coastal wetlands. These habitats support wildlife and livelihoods and can help protect coastlines and store carbon.",
        "Mangroves provide nursery habitats for some fish and help stabilise shorelines.",
        "Why are mangrove wetlands important?",
        ["They support wildlife and can help protect shorelines", "They prevent all coastal change", "They are useful only after being cleared"],
        "Mangroves provide habitat and ecosystem services, including shoreline stabilisation."),
      makeLesson("environment-climate", "Year 3", "Climate change and local adaptation",
        "Climate change refers to long-term shifts in climate patterns. Reducing greenhouse gas emissions can limit future warming, while adaptation helps communities prepare for impacts such as heat, drought, floods, and coastal change.",
        "Climate risks and adaptation needs can vary between Ghana's northern, forest, and coastal zones.",
        "What is climate adaptation?",
        ["Adjusting to actual or expected climate impacts", "A short-term change in tomorrow's weather", "Increasing greenhouse gas emissions"],
        "Adaptation means adjusting systems and practices to reduce harm from climate impacts."),
      makeLesson("environment-conservation", "Year 3", "Conservation and environmental assessment",
        "Conservation protects species, habitats, and ecosystem functions. Before some development projects proceed, environmental assessment can identify likely impacts and ways to avoid, reduce, or manage them.",
        "Avoiding damage at the planning stage is often more effective than trying to repair it later.",
        "What is one purpose of an environmental impact assessment?",
        ["To identify and manage likely environmental effects of a project", "To guarantee that a project has no costs", "To measure only the project's financial profit"],
        "Environmental assessment helps identify likely effects and plan measures to avoid or manage harm.")
    ]
  },
  {
    id: "computer-science",
    name: "Computer Science",
    icon: "💻",
    summary: "Computing fundamentals and Python coding · 3 years",
    lessons: [
      makeLesson("computing-algorithms", "Year 1", "Algorithms and problem solving",
        "An algorithm is a precise sequence of steps for solving a problem. A good algorithm gives the intended result and can be checked using test cases.",
        "A flowchart can represent the steps and decisions in an algorithm.",
        "What is an algorithm?",
        ["A precise sequence of steps for solving a problem", "A type of computer screen", "A random collection of numbers"],
        "Algorithms describe orderly steps that solve a problem or complete a task."),
      makeLesson("computing-hardware", "Year 1", "Computer systems and hardware",
        "A computer system uses hardware and software together. The processor executes instructions, memory holds data the computer is using, and input and output devices let people communicate with it.",
        "The CPU processes instructions, while main memory stores programs and data currently in use.",
        "Which component executes program instructions?",
        ["The central processing unit (CPU)", "A monitor", "A speaker"],
        "The CPU executes instructions and processes data."),
      makeLesson("computing-data", "Year 1", "Data representation and binary",
        "Computers represent information using binary digits: 0 and 1. Text, images, and sound are encoded as patterns of bits that can be stored and processed electronically.",
        "Eight bits make one byte.",
        "What are the two digits used in binary?",
        ["0 and 1", "1 and 2", "A and B"],
        "Binary uses only two digits, 0 and 1."),
      makeLesson("computing-python-strings", "Year 1", "Coding extra: strings and text",
        "A string is text stored as a sequence of characters. In Python, strings are written inside quotation marks and can be combined using the + operator.",
        "The len function returns the number of characters in a string, including spaces.",
        "What does this code display?",
        ["Ama Mensah", "AmaMensah", "name"],
        "The + operator joins the two strings, including the space at the end of the first.",
        'first = "Ama "\nlast = "Mensah"\nprint(first + last)'),
      makeLesson("computing-python-variables", "Year 1", "Coding extra: Python variables and output",
        "A variable gives a name to a value so a program can use it later. Python's print function displays information for a user.",
        "Variable names should describe the information they store.",
        "What will this code display?",
        ["Hello, Ghana!", "message", "It causes an error"],
        "The variable stores the text, and print displays the value stored in message.",
        'message = "Hello, Ghana!"\nprint(message)'),
      makeLesson("computing-python-calculations", "Year 1", "Coding extra: calculations and input",
        "Programs can use arithmetic operators to calculate new values. The input function reads text typed by a user; int converts digit text to a whole number.",
        "In Python, ** is the exponent operator, while * means multiplication.",
        "What value is displayed by this code?",
        ["15", "105", "12"],
        "The input text '7' is converted to the integer 7, then 7 + 8 gives 15.",
        'number = int(input("Enter a number: "))\nprint(number + 8)'),
      makeLesson("computing-programming", "Year 2", "Programming, data, and logic",
        "Programs express algorithms in a language a computer can execute. Variables store data, and selection and repetition structures control which instructions run and how often.",
        "A loop repeats instructions while a condition is true or for a specified number of times.",
        "What does a loop do in a program?",
        ["Repeats a set of instructions", "Deletes the computer's processor", "Turns every value into text"],
        "Loops repeat instructions, usually until a condition is met or a count is reached."),
      makeLesson("computing-databases", "Year 2", "Databases and organised information",
        "A database stores organised information so it can be searched, updated, and analysed. In a relational database, tables contain records, and each field stores one kind of data.",
        "A primary key uniquely identifies each record in a table.",
        "What is the purpose of a primary key?",
        ["To uniquely identify a record", "To format every value as a picture", "To delete duplicate tables automatically"],
        "A primary key provides a unique identifier for each record."),
      makeLesson("computing-python-conditionals", "Year 2", "Coding extra: decisions with if and else",
        "Conditional statements let a program choose what to do based on a test. Python uses if and else blocks, with indentation to show which instructions belong to each choice.",
        "The comparison operator == checks whether two values are equal.",
        "What does this code print when score is 62?",
        ["Pass", "Try again", "score"],
        "Since 62 is at least 50, the condition is true and the program prints Pass.",
        'score = 62\nif score >= 50:\n    print("Pass")\nelse:\n    print("Try again")'),
      makeLesson("computing-python-loops", "Year 2", "Coding extra: loops and repetition",
        "Loops repeat instructions and help avoid writing the same code many times. A for loop can visit each item in a sequence or repeat for a chosen range of values.",
        "In Python, range(1, 4) produces 1, 2, and 3; the stop value is not included.",
        "How many times does this loop print a number?",
        ["Three times", "Four times", "Once"],
        "range(1, 4) gives three values: 1, 2, and 3.",
        "for number in range(1, 4):\n    print(number)"),
      makeLesson("computing-python-debugging", "Year 2", "Coding extra: testing and debugging",
        "Testing checks whether a program behaves as intended, while debugging is the process of finding and correcting errors. Test cases should include typical, boundary, and unexpected inputs.",
        "A syntax error breaks the language rules; a logic error runs but produces the wrong result.",
        "A program runs but calculates the wrong total. What kind of error is most likely?",
        ["A logic error", "A syntax error that prevents it starting", "A hardware input device"],
        "A logic error means the program runs but its instructions do not produce the intended result."),
      makeLesson("computing-python-functions", "Year 3", "Coding extra: reusable functions",
        "A function groups instructions under a name so they can be reused. Parameters let a function receive information, and return sends a result back to the code that called it.",
        "A function should have a clear purpose and a descriptive name.",
        "What does this function return when called with 5?",
        ["10", "5", "It prints nothing and returns no value"],
        "The function multiplies its input by two, so double(5) returns 10.",
        "def double(number):\n    return number * 2\n\nprint(double(5))"),
      makeLesson("computing-python-lists", "Year 3", "Coding extra: lists and data",
        "A list stores an ordered collection of values. Python lists use zero-based indexing, so the first item is at index 0; programs can loop through a list to process each value.",
        "The append method adds a new item to the end of a Python list.",
        "What value is stored at scores[0]?",
        ["18", "24", "31"],
        "Python indexing starts at zero, so scores[0] is the first value, 18.",
        "scores = [18, 24, 31]\nprint(scores[0])"),
      makeLesson("computing-web", "Year 3", "Web technologies and digital citizenship",
        "Web pages use technologies such as HTML for structure, CSS for presentation, and JavaScript for interactive behaviour. Digital citizenship includes communicating responsibly and respecting other people's work and privacy.",
        "A browser requests web resources from servers using network protocols such as HTTPS.",
        "Which technology primarily describes the structure of a web page?",
        ["HTML", "CSS", "An image editor"],
        "HTML provides the structure and meaning of web page content."),
      makeLesson("computing-python-dictionaries", "Year 3", "Coding extra: dictionaries and records",
        "A Python dictionary stores related values as key-value pairs. A key can be used to look up its associated value, which is useful for representing labelled information.",
        "Dictionary keys are used to retrieve their corresponding values.",
        "What value does this code display?",
        ["Accra", "Ghana", "The first item in a list"],
        'The key "capital" maps to the value "Accra" in the dictionary.',
        'country = {"name": "Ghana", "capital": "Accra"}\nprint(country["capital"])'),
      makeLesson("computing-networks", "Year 3", "Computer networks and cybersecurity",
        "A computer network connects devices so they can exchange data. Cybersecurity uses practices and technologies to protect systems, accounts, and information from unauthorised access.",
        "Strong unique passwords and multi-factor authentication help protect accounts.",
        "Why is multi-factor authentication useful?",
        ["It requires another proof of identity beyond a password", "It shares your password publicly", "It removes the need to update software"],
        "Multi-factor authentication adds an additional identity check, making stolen passwords less useful.")
    ]
  },
  {
    id: "psychology",
    name: "Psychology",
    icon: "🧠",
    summary: "Psychology topics across Year 1, Year 2, and Year 3",
    lessons: [
      makeLesson("psychology-research", "Year 1", "Psychological research methods",
        "Psychologists study behaviour and mental processes using systematic methods. They form testable questions, gather evidence, and consider ethical protections for participants.",
        "A correlation between two factors does not by itself show that one factor caused the other.",
        "What can a correlation between two factors tell us?",
        ["They vary together, but not necessarily that one caused the other", "One factor definitely caused the other", "The results must be incorrect"],
        "Correlation shows an association; more evidence is needed to establish a cause-and-effect relationship."),
      makeLesson("psychology-biology", "Year 1", "The brain, nervous system, and behaviour",
        "The nervous system receives information, processes it, and coordinates responses. The brain contains interconnected neurons, and behaviour can be influenced by biological processes as well as experience and context.",
        "Neurons communicate with other cells using electrical signals and chemical neurotransmitters.",
        "What is one role of the nervous system?",
        ["To receive information and coordinate responses", "To digest food in the stomach", "To produce all the body's oxygen"],
        "The nervous system helps detect information and coordinate the body's responses."),
      makeLesson("psychology-development", "Year 1", "Human development across the lifespan",
        "Developmental psychology studies how people change and remain similar over time. Physical, cognitive, and social development can be shaped by biological factors, relationships, culture, and life experiences.",
        "Development continues throughout life; it is not limited to childhood.",
        "Which statement best describes human development?",
        ["It involves changes across the lifespan and has multiple influences", "It ends at birth", "It is exactly the same for every person"],
        "Human development continues throughout life and reflects interacting influences."),
      makeLesson("psychology-learning", "Year 2", "Learning and memory",
        "Learning is a relatively lasting change in knowledge or behaviour through experience. Memory involves encoding, storing, and retrieving information, and can be affected by attention and practice.",
        "Retrieval practice—trying to recall information—can strengthen learning more than simply rereading notes.",
        "What is retrieval practice?",
        ["Actively recalling information from memory", "Copying notes without thinking", "Avoiding review after learning"],
        "Retrieval practice involves bringing learned information to mind, helping strengthen later recall."),
      makeLesson("psychology-conditioning", "Year 2", "Classical and operant conditioning",
        "Learning can occur through associations and consequences. Classical conditioning links stimuli, while operant conditioning describes how consequences can change the likelihood of a behaviour.",
        "Reinforcement increases the likelihood that a behaviour will happen again.",
        "What is the usual effect of reinforcement on a behaviour?",
        ["It makes the behaviour more likely to happen again", "It always removes a memory", "It prevents a person from learning"],
        "Reinforcement increases the likelihood of the behaviour it follows."),
      makeLesson("psychology-perception", "Year 2", "Sensation, perception, and attention",
        "Sensation is the detection of information by sensory receptors. Perception is how the brain organises and interprets that information; attention affects which information receives more processing.",
        "The same scene can be interpreted differently depending on attention and prior experience.",
        "How is perception different from sensation?",
        ["Perception interprets sensory information", "Sensation is a type of memory test", "They mean exactly the same thing"],
        "Sensation detects input; perception organises and interprets it."),
      makeLesson("psychology-stress", "Year 2", "Emotion, stress, and coping",
        "Emotions involve interacting bodily responses, thoughts, and behaviour. Stress can occur when demands feel difficult to manage; coping strategies such as problem-solving, rest, and social support may help.",
        "People respond differently to stressful situations, and seeking support can be a useful coping strategy.",
        "Which is a constructive coping strategy?",
        ["Seeking trusted support and identifying practical next steps", "Ignoring every problem indefinitely", "Blaming oneself for every difficulty"],
        "Support and practical problem-solving can help a person manage a stressful situation."),
      makeLesson("psychology-social", "Year 3", "Social influence and human behaviour",
        "People's thoughts and actions can be influenced by social situations, group expectations, and cultural context. Psychological explanations use evidence and recognise that behaviour has multiple influences.",
        "The presence of other people can affect behaviour, but people do not all respond in the same way.",
        "Why should psychologists avoid explaining behaviour with only one factor?",
        ["Behaviour can be influenced by multiple interacting factors", "All people behave identically", "Evidence is never needed"],
        "Human behaviour is complex and can be shaped by multiple interacting biological, psychological, and social factors."),
      makeLesson("psychology-personality", "Year 3", "Personality and individual differences",
        "Psychologists study how people differ in patterns of thought, feeling, and behaviour. Personality measures can describe tendencies, but no single score fully captures a person or determines what they will do.",
        "A psychological test should be assessed for reliability and validity before its results are interpreted.",
        "What does reliability mean for a psychological measure?",
        ["It gives reasonably consistent results under consistent conditions", "It measures every possible human trait", "It guarantees that a prediction is always correct"],
        "Reliability concerns the consistency of a measure; validity concerns whether it measures what it is intended to measure."),
      makeLesson("psychology-mental-health", "Year 3", "Mental health, support, and wellbeing",
        "Mental health includes emotional, psychological, and social wellbeing. Difficulties can have many contributing factors, and appropriate support may include trusted adults, health professionals, and community services.",
        "Mental health conditions are not personal failures, and asking for help is a positive step.",
        "What is a helpful response when someone is struggling with their mental health?",
        ["Listen without judgement and encourage appropriate support", "Dismiss their feelings", "Promise that one simple trick will fix everything"],
        "Listening respectfully and supporting access to qualified help are safer and more helpful responses.")
    ]
  }
];

const biologyLearningNotes = {
  "biology-cells": {
    objectives: [
      "Describe the main parts shared by animal and plant cells.",
      "Explain how specialised cells suit their functions."
    ],
    vocabulary: [
      ["Cell", "The basic structural and functional unit of life."],
      ["Organelle", "A specialised structure inside a cell."],
      ["Tissue", "A group of similar cells working together."]
    ],
    sections: [
      {
        title: "A cell is a working system",
        body: "The cell membrane controls what enters and leaves the cell. Cytoplasm is where many chemical reactions happen. The nucleus contains genetic material that helps control cell activities. Plant cells also have a cellulose cell wall for support, a large permanent vacuole containing cell sap, and chloroplasts in many green tissues."
      },
      {
        title: "Cells become specialised",
        body: "In multicellular organisms, cells develop structures suited to particular jobs. A red blood cell has a flexible shape and contains haemoglobin to carry oxygen. A root hair cell has a long extension that increases the surface area for absorbing water and mineral ions. A nerve cell has a long fibre to carry electrical impulses over distance."
      },
      {
        title: "From cells to organisms",
        body: "Similar cells form tissues; tissues combine to make organs; organs work together in organ systems; and organ systems make up an organism. For example, muscle tissue, blood, and other tissues form the heart, which works with blood vessels as part of the circulatory system."
      }
    ],
    example: "When comparing a root hair cell with a red blood cell, link each structure to its job: the root hair's long extension improves absorption, while the red blood cell's shape and haemoglobin support oxygen transport.",
    recap: "Cells contain structures that perform life functions. Specialised cells have adaptations that help them do particular jobs, and cells are organised into tissues, organs, and systems.",
    watchOut: "Plant cells do not all contain chloroplasts. Roots, for example, are usually not exposed to light and generally lack chloroplasts."
  },
  "biology-classification": {
    objectives: [
      "Explain why biologists classify organisms and describe biodiversity at different levels.",
      "Use the taxonomic hierarchy and write a binomial scientific name correctly.",
      "Compare broad features used to distinguish major groups of organisms.",
      "Use a simple dichotomous key and explain how evidence can change classifications."
    ],
    vocabulary: [
      ["Classification", "The systematic organisation of organisms into groups based on shared evidence and relationships."],
      ["Taxonomy", "The branch of biology concerned with naming and classifying organisms."],
      ["Taxon", "A named classification group at any rank, such as a family or genus."],
      ["Species", "A basic classification unit; for many sexually reproducing organisms, members can interbreed and produce fertile offspring."],
      ["Genus", "A rank containing closely related species."],
      ["Binomial nomenclature", "The two-part system of naming a species with its genus name followed by its specific epithet."],
      ["Biodiversity", "The variety of life, including genetic diversity, species diversity, and ecosystem diversity."],
      ["Dichotomous key", "An identification tool that guides a user through paired, contrasting statements."],
      ["Prokaryote", "An organism whose cells lack a membrane-bound nucleus."],
      ["Eukaryote", "An organism whose cells contain a membrane-bound nucleus and other membrane-bound organelles."],
      ["Phylogeny", "The evolutionary history and relationships of organisms."]
    ],
    sections: [
      {
        title: "1. What classification is and why it matters",
        body: "Earth supports an enormous variety of organisms. Classification is the organised way biologists identify, name, and group this diversity. Without a shared system, the same organism may have different local names in different languages or communities, and a single local name may refer to more than one species. Scientific names and agreed classification groups let students, farmers, conservation workers, health professionals, and researchers communicate about the same organism. Classification also helps us identify unknown organisms, compare their characteristics, predict features they may share with relatives, and organise evidence about the history of life. Taxonomy focuses on naming and classification; identification is the process of deciding which known organism a specimen is most likely to be.\n\nClassification is not simply arranging organisms from 'simple' to 'advanced'. Living organisms have been evolving for the same amount of time since their lineages diverged, and each has adaptations to its own way of life. Instead, a classification system is a testable way to organise evidence and communicate hypotheses about similarities and relationships. A useful classification should be clear, consistent, and supported by observations that other people can check."
      },
      {
        title: "2. Biodiversity: variation at three levels",
        body: "Biodiversity is not only the number of species present. Genetic diversity is variation in inherited information among individuals or populations of the same species. Species diversity concerns the variety of species and their relative abundance in a place. Ecosystem diversity describes the variety of habitats and ecological communities, such as forests, savannahs, rivers, lagoons, and coastal wetlands. These levels are connected: genetic variation can help a population respond to change, species interact within communities, and ecosystems provide the conditions in which populations survive. Classification helps us record and compare this diversity, but an inventory is only a starting point; understanding relationships and protecting habitats also matter.\n\nFor example, counting ten species in two areas gives the same simple species richness, but it does not tell us whether one species dominates one area or whether individuals within each species have much genetic variation. Ecologists therefore select a measure that matches the question. A species list can describe richness; counts can estimate relative abundance; genetic sampling can compare variation within populations; and habitat surveys can document ecosystem diversity. Sampling must be planned carefully because rare, seasonal, nocturnal, or hard-to-detect organisms may be missed. A survey describes what was observed under particular conditions, not necessarily every organism present.",
        figure: {
          src: "assets/ghana-biodiversity.svg",
          alt: "Illustrated forest, savannah, and coastal wetland habitats with example plants and animals.",
          caption: "Different Ghanaian habitats support different communities. The drawing is illustrative, not a complete species inventory."
        }
      },
      {
        title: "3. The taxonomic hierarchy",
        body: "Organisms are placed in nested groups, from broad categories to more specific ones. A commonly taught sequence is domain, kingdom, phylum (called division in some plant classifications), class, order, family, genus, and species. A memory aid is: Dear King Philip Came Over For Good Soup. Each lower rank usually contains organisms with more features in common. The genus and species together identify a species in the binomial system. Do not confuse a rank, such as family, with a particular taxon, such as Hominidae. Modern classification may use additional ranks, and some groups are still being revised as new evidence is studied.\n\nA taxonomic hierarchy can be pictured as a set of nested boxes. The broadest box contains many organisms; every box inside it contains a smaller subset. Moving from domain towards species generally increases the number of shared characteristics and reduces the number of organisms in the group. This is a useful pattern, but do not assume that every organism in the same rank shares one simple visible feature. A taxon is supported by a combination of evidence, and the characters used to define a group depend on the group being studied.",
        figure: {
          src: "assets/taxonomic-hierarchy.svg",
          alt: "Nested taxonomic ranks from Domain Eukarya to the human species Homo sapiens.",
          caption: "Example human classification. The labels illustrate nested ranks; course materials may use a specified classification scheme."
        }
      },
      {
        title: "4. An example: classifying humans",
        body: "Humans can be placed in Domain Eukarya because our cells have nuclei; Kingdom Animalia because we are multicellular organisms that obtain food by ingestion and lack cell walls; Phylum Chordata because humans have chordate features during development; Class Mammalia because we have features such as hair and mammary glands; Order Primates; Family Hominidae; Genus Homo; and species Homo sapiens. This route shows the nested nature of classification: every human is an animal, but not every animal is a mammal, and not every mammal is a primate. Different modern authorities may use revised group boundaries or ranks as relationships are studied.\n\nWhen you justify a rank, give a characteristic or accepted relationship that supports it. 'Humans are mammals' is supported by mammalian features such as hair and milk production by mammary glands. For higher groups, features can be present at particular developmental stages or may be identified using anatomical and genetic evidence rather than an obvious adult feature. A classification table is a summary, not proof by itself: the evidence and definitions behind the categories explain why an organism belongs there."
      },
      {
        title: "5. Broad features used to classify organisms",
        body: "Biologists use multiple characteristics rather than relying on one superficial resemblance. Cell type is important: bacteria and archaea are prokaryotic, while animals, plants, fungi, and many other organisms are eukaryotic. Number and organisation of cells, cell-wall composition, mode of nutrition, movement, reproduction, and genetic evidence can also be informative. Animals are generally multicellular consumers without cell walls. Plants are generally multicellular photosynthetic organisms with cellulose cell walls. Fungi absorb nutrients and typically have chitin-containing cell walls. Bacteria are diverse single-celled prokaryotes with many different metabolisms. Archaea are also prokaryotic but have distinctive molecular and biochemical features. Many organisms traditionally grouped as protists are eukaryotes that do not fit neatly into the plant, animal, or fungi examples used in basic classification.\n\nA good comparison uses homologous features—that is, features compared because they have a meaningful common basis—and considers the organism's whole biology. Two organisms may both fly, for instance, but wings in birds and insects differ in structure and evolutionary origin. Similar function alone does not prove close relationship. Likewise, organisms living in similar environments can independently evolve similar adaptations. To avoid a misleading classification, scientists compare several characters and look for a consistent pattern rather than selecting just one convenient feature."
      },
      {
        title: "6. Classification systems and changing evidence",
        body: "A traditional school model often teaches kingdoms such as Animalia, Plantae, Fungi, Protoctista (or Protista), and Prokaryotae/Monera. Some curricula separate prokaryotes into the domains Bacteria and Archaea, and modern biology recognises Domain Eukarya for organisms with nucleated cells. The exact number and names of kingdoms can vary between textbooks and scientific systems, so use the classification model specified by your teacher or syllabus in examinations. The underlying principle is to group organisms using evidence. Similarities in DNA and proteins can reveal relationships that are not obvious from appearance alone. As methods improve and new organisms are studied, groups and names may be updated.\n\nThis is why a school text and a newer reference may show different kingdom arrangements. The difference does not mean that classification is arbitrary: it can mean that scientists are using different criteria, taxonomic ranks, or amounts of genetic evidence. In an examination, follow the model named in the question or taught for the course. In research, check the date and authority of a classification and note when boundaries remain under discussion. Scientific names also have rules set by nomenclature codes, while the placement of organisms into groups is a scientific hypothesis that may change."
      },
      {
        title: "7. Scientific names and binomial nomenclature",
        pageBreakBefore: true,
        body: "Each species is given a two-part scientific name: the genus followed by the specific epithet. The genus starts with a capital letter, the epithet with a lowercase letter, and the complete name is italicised when typed. If handwritten, the two words are usually underlined separately. For example, in Homo sapiens, Homo is the genus and sapiens is the specific epithet; together they name the species. After a full first mention, the genus may be abbreviated, as H. sapiens, if the meaning is clear. A specific epithet alone is not the full species name because the same epithet can occur in more than one genus. Scientific names help avoid ambiguity among local and common names."
      },
      {
        title: "8. Species: useful definition and limitations",
        body: "For many sexually reproducing organisms, a species is commonly described as a group whose members can interbreed naturally and produce fertile offspring. This biological species concept is useful, but it does not apply neatly to every case. Asexual organisms do not mate; fossils cannot be tested for interbreeding; and some distinct species hybridise. Therefore, scientists may also compare physical features, ecological roles, behaviour, and genetic relationships when identifying species. A specimen should not be assigned a species solely because it looks similar to one photograph. Reliable identification uses multiple traits, location information, expert references, and, where necessary, laboratory evidence."
      },
      {
        title: "9. How to use a dichotomous key",
        body: "A dichotomous key identifies an organism through a sequence of paired choices. At each step, read both statements, select the one that best matches the specimen, and follow the instruction to the next pair or to a name. Choices should be based on observable features and should contrast clearly—for example, leaves with parallel veins versus leaves with branching net-like veins. Examine several specimens if possible, use a hand lens for small features, and do not guess when a feature is hidden or damaged. If no option fits, return to the earlier choices and check your observations. A key is only as useful as its descriptions and the organisms it was designed to identify.\n\nThe paired statements should be mutually exclusive for the specimens being identified, and both should describe the same kind of feature. A pair such as 'has a backbone' and 'has no backbone' is easier to use than 'is large' and 'has wings', because size and wings are different criteria and an organism might match both. Start with features that are easy to observe and divide the available organisms into manageable groups. A key made for a small class collection should not be used to identify every species on Earth.",
        figure: {
          src: "assets/dichotomous-key.svg",
          alt: "A branching key uses paired visible traits to identify a tilapia, grasshopper, maize plant, or fern.",
          caption: "Example of a simple identification key. Follow the numbered alternatives using features you can actually observe."
        }
      },
      {
        title: "10. Practical example: build and test a simple key",
        body: "Imagine identifying four familiar organisms by visible features: a maize plant, a fern, a grasshopper, and a tilapia. Start with a paired choice that separates organisms with a backbone from those without one. The tilapia has a backbone; the grasshopper does not. For the two plants, use a second pair: the maize has narrow leaves with parallel veins, while the fern has divided fronds and reproduces by spores rather than producing flowers and seeds. Each pair should split the remaining organisms into clear groups. To test the key, ask another learner to identify a specimen without being told its name. If they reach different answers from the same evidence, revise vague terms such as 'large' or 'small' and replace them with more precise observations."
      },
      {
        title: "11. Classification, evolution, and common ancestry",
        body: "Modern classification aims to reflect evolutionary relationships. Organisms that share a more recent common ancestor are generally expected to have more features in common than organisms whose common ancestor is much older. A phylogenetic tree is a hypothesis about relationships: branch points represent proposed common ancestors, and the pattern of branches shows how groups are related. DNA comparisons, fossils, anatomy, and embryological evidence can all contribute. A tree does not say that one modern species is the ancestor of another modern species; instead, related living groups share ancestors in the past. Similar features can also evolve independently in unrelated groups, so scientists examine several types of evidence."
      },
      {
        title: "12. Why biodiversity and classification matter in Ghana",
        body: "Recording organisms and their habitats can help communities understand changes in biodiversity and plan conservation. Ghana's landscapes include savannah, forest, rivers, wetlands, and coastal environments, each supporting different communities. Accurate identification helps distinguish native species from introduced species, monitor threatened populations, and describe organisms consistently in research and education. For school fieldwork, observe organisms without damaging them: record the date, habitat, visible features, and location as required by your teacher, and follow local safety guidance. A photograph or drawing may be more appropriate than collecting a specimen. Never handle an unfamiliar animal, plant, or fungus without guidance."
      },
      {
        title: "13. How to answer classification questions",
        body: "When asked to classify an organism, state the feature that supports each group rather than listing names alone. When asked to compare two organisms, give a paired difference using the same characteristic for both. When using a key, show the sequence of choices and the observation that justified each one. When writing a scientific name, check capitalisation, spelling, and italics. In questions about biodiversity, identify whether the evidence concerns genes within a species, the number or variety of species, or habitats and ecosystems. If an exam question specifies a kingdom system, follow that system and its vocabulary."
      },
      {
        title: "14. Observe and record a specimen systematically",
        body: "Begin with observations that can be checked: the specimen's overall shape, body covering, number and arrangement of parts, leaf or limb features, and other structures relevant to the key. Separate an observation from an inference. 'The leaf has parallel veins' is an observation; 'it is a monocot' is an interpretation based on that observation and other evidence. Use a labelled drawing or photograph to preserve details, and record the habitat and date when these are relevant. If using a microscope or hand lens, follow classroom instructions and record magnification or scale where requested. Compare more than one individual when possible, because age, season, damage, and natural variation can alter appearance. Accurate notes allow another learner to check how you reached your identification."
      },
      {
        title: "15. Making a simple classification table",
        body: "A classification table helps you compare several organisms using the same set of features. Put organisms in columns or rows and use consistent character headings, such as cell type, presence of a backbone, leaf-vein pattern, or method of reproduction. Enter a clear observation for each organism and avoid changing the meaning of a category halfway through the table. A feature is useful when it helps distinguish groups; a feature shared by every organism in the sample may provide little separation. Once the table is complete, look for combinations of characters that group some organisms together. Explain the evidence for each grouping and state the limits of your sample. A classroom table describes the organisms studied; it does not automatically represent every member of a larger group."
      },
      {
        title: "16. Common errors and how to correct them",
        body: "One frequent error is treating common names as exact scientific names. Common names vary between languages and communities, so identify the organism with a recognised scientific name when precision matters. Another error is writing only the specific epithet: both parts of the binomial are needed. Learners may also believe that a key is a list to memorise; instead, it is a tool that depends on observing the specimen carefully and following each paired choice. Do not assume that two organisms are closely related just because they look alike or live in similar places; similar traits may have evolved independently. Finally, avoid saying that one living organism is 'more evolved' than another. Use the evidence and the classification model stated in the lesson or question."
      },
      {
        title: "17. A practical classroom activity",
        body: "Work in a group with teacher-approved pictures or specimens of familiar organisms. First agree on a small collection that everyone can observe safely. Make a list of visible characteristics, then choose one feature that divides the collection into two clear groups. Write a pair of alternatives and repeat the process for each group until every organism can be identified. Swap keys with another group and ask them to identify the same organisms without extra clues. Note any statement that causes disagreement, then revise it to use clearer, measurable language. At the end, explain which observations were most useful and which organisms were difficult to separate. Do not collect protected organisms or handle unknown specimens; drawings and photographs can be used instead."
      },
      {
        title: "18. Using classification knowledge beyond the classroom",
        body: "Classification is useful in agriculture, public health, conservation, and scientific research. Correctly identifying a crop pest can help a farmer seek appropriate advice; identifying a disease-causing organism can help health professionals communicate about it; and monitoring a species over time can help conservation teams recognise changes in its distribution. In each setting, identification needs reliable references and may require expert confirmation. A school learner should not make treatment or safety decisions based on a guess from a simple key. The value of classification comes from clear shared descriptions and evidence that others can review. Local knowledge and scientific naming can complement one another: record a local name when appropriate, while also documenting the scientific identification and how it was established."
      },
      {
        title: "19. Review questions for active learning",
        body: "Try answering these questions before looking back at the notes. What is the difference between a taxonomic rank and a taxon? How does species diversity differ from ecosystem diversity? Why are both words of a binomial name needed? What should you do if a specimen seems to fit neither statement in a dichotomous key? Why might two sources use different kingdom arrangements? Explain one reason why DNA evidence can change a classification. For each answer, support your explanation with an example from the lesson. If you are unsure, identify the exact term or step that is confusing and revisit that section. Being able to explain a concept in your own words is a stronger check of understanding than memorising a list."
      }
    ],
    example: "To identify an unknown leaf, first record visible features such as whether it is simple or divided, its vein pattern, and its arrangement on the stem. At each step of a dichotomous key, choose the statement supported by an actual observation. Keep following the numbered choices until the key gives a likely identity. Then compare the specimen with a reliable reference and check that its habitat and other features make sense. If two statements both seem possible, do not force a conclusion: re-check the specimen or use a better key.",
    recap: "Classification organises biodiversity and gives scientists a shared way to identify organisms. Taxonomic ranks form nested groups; binomial names identify species with genus plus specific epithet. Biologists compare cells, structures, life processes, and DNA, and use identification keys to work with specimens. Classification models can differ and change as evidence develops, so use the system required by your course while understanding the evidence behind it.",
    watchOut: "Do not treat a classification chart as an unchanging list that all scientists use identically. Kingdom systems and species definitions can vary, and new evidence can revise relationships. In exams, follow the model named by the question or taught in your syllabus; in scientific reasoning, support a classification with observable and genetic evidence."
  },
  "biology-photosynthesis": {
    objectives: [
      "State the word equation for photosynthesis.",
      "Describe where photosynthesis occurs and factors that affect its rate."
    ],
    vocabulary: [
      ["Chlorophyll", "A green pigment that absorbs light energy."],
      ["Stoma", "A pore in a leaf that allows gas exchange."],
      ["Limiting factor", "A condition that restricts the rate of a process."]
    ],
    sections: [
      {
        title: "Making food using light",
        body: "Photosynthesis transfers light energy into chemical energy stored in glucose. The word equation is carbon dioxide + water → glucose + oxygen. The process takes place in chloroplasts, where chlorophyll absorbs light. Plants use glucose for respiration, growth, storage, and making other substances."
      },
      {
        title: "How materials reach the leaf",
        body: "Carbon dioxide diffuses into a leaf through stomata. Water is absorbed by roots and carried to leaves in xylem. Oxygen produced by photosynthesis can diffuse out. Stomata open and close, balancing gas exchange with water loss."
      },
      {
        title: "What changes the rate?",
        body: "Light intensity, carbon dioxide concentration, and temperature can affect the rate of photosynthesis. If one factor is in short supply, it can limit the rate even when other conditions are favourable. Very high temperatures can damage enzymes involved in the process."
      }
    ],
    example: "A healthy maize plant in low light may photosynthesise slowly even if it has enough water. Increasing light can raise the rate until another factor, such as carbon dioxide, becomes limiting.",
    recap: "Photosynthesis uses light to make glucose from carbon dioxide and water, releasing oxygen. It occurs in chloroplasts and its rate depends on environmental conditions.",
    watchOut: "Plants also respire. Photosynthesis stores energy in glucose; respiration releases usable energy from glucose in living cells."
  },
  "biology-transport": {
    objectives: [
      "Compare the roles of xylem and phloem.",
      "Explain how transpiration helps move water through a plant."
    ],
    vocabulary: [
      ["Xylem", "Vessels that transport water and mineral ions, mainly from roots upwards."],
      ["Phloem", "Tissue that transports dissolved sugars and other organic substances."],
      ["Transpiration", "Loss of water vapour from a plant, mainly through leaf stomata."]
    ],
    sections: [
      {
        title: "Transport in plants",
        body: "Root hair cells absorb water from soil and mineral ions by suitable transport processes. Xylem vessels carry water and mineral ions towards stems and leaves. Their thickened walls help support the plant, and mature xylem vessels are hollow."
      },
      {
        title: "The transpiration stream",
        body: "Water evaporates from moist surfaces inside a leaf and diffuses out through stomata. This loss creates a pull that helps draw water upward through xylem from the roots. High temperature, moving air, and low humidity can increase transpiration; closing stomata can reduce water loss."
      },
      {
        title: "Moving sugars",
        body: "Phloem transports sucrose and other dissolved substances from sources, such as photosynthesising leaves, to sinks, such as growing roots, fruits, or storage tissues. This movement is called translocation and can occur in different directions in different phloem tubes."
      }
    ],
    example: "On a hot, dry day, a plant may lose water quickly through open stomata. If roots cannot replace water fast enough, cells lose firmness and the plant may wilt.",
    recap: "Xylem carries water and mineral ions; phloem translocates sugars. Transpiration from leaves helps maintain the upward movement of water.",
    watchOut: "Transpiration is water loss; translocation is the movement of sugars in phloem. They are related to plant transport but are not the same process."
  },
  "biology-genetics": {
    objectives: [
      "Distinguish DNA, genes, alleles, and chromosomes.",
      "Explain how inheritance and meiosis contribute to variation."
    ],
    vocabulary: [
      ["DNA", "The molecule that carries genetic information in cells."],
      ["Gene", "A section of DNA associated with a functional product or inherited characteristic."],
      ["Allele", "An alternative version of a gene."]
    ],
    sections: [
      {
        title: "How genetic information is organised",
        body: "DNA is packaged into chromosomes in the nucleus of many cells. A gene is a particular DNA sequence. Different versions of a gene are called alleles. Many characteristics are influenced by several genes and by environmental factors, so not every feature follows a simple dominant-recessive pattern."
      },
      {
        title: "Passing genes to offspring",
        body: "In sexual reproduction, gametes carry one chromosome from each homologous pair. At fertilisation, gametes combine and the offspring receives genetic information from both biological parents. Meiosis and fertilisation help create different combinations of alleles."
      },
      {
        title: "Genotype and phenotype",
        body: "Genotype describes an organism's alleles for a gene or set of genes. Phenotype describes observable characteristics produced through interactions between genetic information and the environment. A Punnett square can help model possible allele combinations for a simple inheritance example."
      }
    ],
    example: "If a parent plant passes one allele to a seed and another parent contributes a second allele, the seed receives a pair for that gene. The resulting characteristic depends on the alleles and can also be influenced by growing conditions.",
    recap: "Genes are DNA sequences, alleles are gene variants, and chromosomes carry many genes. Offspring inherit combinations from gametes, and phenotype can reflect both genes and environment.",
    watchOut: "Dominant does not mean common, better, or stronger. It describes how an allele affects a phenotype in a particular inheritance pattern."
  },
  "biology-nutrition": {
    objectives: [
      "Identify major nutrient groups and their roles.",
      "Trace food through the digestive system and explain absorption."
    ],
    vocabulary: [
      ["Digestion", "The breakdown of large food molecules into smaller soluble molecules."],
      ["Enzyme", "A biological catalyst that speeds up a reaction."],
      ["Absorption", "Movement of digested nutrients through the gut wall into blood or lymph."]
    ],
    sections: [
      {
        title: "A balanced diet",
        body: "Carbohydrates and fats provide energy; proteins supply amino acids for growth and repair. Vitamins and minerals are needed in smaller amounts for healthy body functions, while fibre supports movement of food through the gut and water is essential for cell processes. A balanced diet depends on a person's needs and circumstances."
      },
      {
        title: "Digestion along the gut",
        body: "Food is ingested, moved through the alimentary canal, digested, absorbed, and the remaining material is egested. Mechanical digestion breaks food into smaller pieces. Enzymes catalyse chemical digestion: for example, amylase breaks starch into smaller sugars, and proteases break proteins into peptides and amino acids."
      },
      {
        title: "Absorbing nutrients",
        body: "Most digested nutrients are absorbed in the small intestine. Its many villi and microvilli provide a large surface area, and a rich blood supply helps carry absorbed substances away. Fatty acids and glycerol enter the lymphatic system before joining the bloodstream."
      }
    ],
    example: "Chewing a piece of starchy food increases its surface area. Salivary amylase begins starch digestion; later digestion and absorption provide small molecules the body can use.",
    recap: "A balanced diet provides nutrients for energy and health. Digestion mechanically and chemically breaks food down; nutrients are then absorbed, mainly in the small intestine.",
    watchOut: "Digestion is not the same as absorption: digestion breaks molecules down, while absorption moves soluble products across the gut wall."
  },
  "biology-respiration": {
    objectives: [
      "Distinguish cellular respiration from breathing.",
      "Compare aerobic and anaerobic respiration."
    ],
    vocabulary: [
      ["Cellular respiration", "Cell reactions that release usable energy from nutrient molecules."],
      ["Aerobic", "Taking place with oxygen available."],
      ["Anaerobic", "Taking place without oxygen."]
    ],
    sections: [
      {
        title: "Releasing energy in cells",
        body: "Cells need energy for processes such as active transport, movement, growth, and synthesis of molecules. In aerobic respiration, glucose reacts with oxygen and releases energy; the products are carbon dioxide and water. The energy is transferred into forms the cell can use."
      },
      {
        title: "When oxygen is limited",
        body: "Some cells can release energy anaerobically. In human muscle, anaerobic respiration produces lactate. In yeast, anaerobic respiration (fermentation) produces ethanol and carbon dioxide. These pathways release less energy per glucose molecule than aerobic respiration."
      },
      {
        title: "Respiration and gas exchange",
        body: "Breathing moves air into and out of the lungs; gas exchange moves oxygen and carbon dioxide between air and blood. Cellular respiration is a set of chemical reactions inside cells. Oxygen transported by blood can then be used in aerobic respiration."
      }
    ],
    example: "During vigorous exercise, working muscles need energy rapidly. If oxygen delivery cannot meet demand, some energy is released anaerobically and lactate can accumulate temporarily.",
    recap: "Cellular respiration releases usable energy. Aerobic respiration uses oxygen; anaerobic pathways work without it and release less energy. Breathing supplies air but is not itself cellular respiration.",
    watchOut: "Respiration does not mean breathing. Breathing is ventilation; respiration is a chemical process in cells."
  },
  "biology-reproduction": {
    objectives: [
      "Explain pollination and fertilisation in flowering plants.",
      "Compare sexual and asexual reproduction."
    ],
    vocabulary: [
      ["Pollination", "Transfer of pollen from anther to stigma."],
      ["Fertilisation", "Fusion of the nuclei of male and female gametes."],
      ["Gamete", "A reproductive cell carrying genetic information."]
    ],
    sections: [
      {
        title: "Flower structures and pollination",
        body: "Anthers produce pollen containing male gametes; the stigma receives pollen. Pollination may occur through wind or animals. After pollen reaches a compatible stigma, a pollen tube can grow down the style towards an ovule."
      },
      {
        title: "Fertilisation and seed formation",
        body: "A male nucleus travels through the pollen tube and fuses with the female nucleus in an ovule. This is fertilisation. The fertilised ovule develops into a seed, and the ovary often develops into a fruit. Seeds can germinate when suitable conditions are available."
      },
      {
        title: "Two reproductive strategies",
        body: "Sexual reproduction involves gametes and typically creates genetic variation among offspring. Asexual reproduction involves one parent and no fusion of gametes; offspring are often genetically very similar to the parent. Each strategy has advantages depending on the environment."
      }
    ],
    example: "A bee visiting a flower may carry pollen from one plant's anther to another flower's stigma. If fertilisation follows, seeds may develop, helping the plant reproduce and disperse.",
    recap: "Pollination moves pollen to a stigma; fertilisation joins gamete nuclei. Seeds form after fertilisation. Sexual reproduction tends to create variation, while asexual reproduction can rapidly produce similar offspring.",
    watchOut: "Pollination is not fertilisation. Pollination moves pollen; fertilisation is the later fusion of nuclei."
  },
  "biology-evolution": {
    objectives: [
      "Describe the steps of natural selection.",
      "Explain why populations, rather than individual organisms, evolve."
    ],
    vocabulary: [
      ["Variation", "Differences among individuals in a population."],
      ["Heritable", "Able to be passed from parents to offspring through genetic information."],
      ["Natural selection", "A process in which heritable traits linked to reproductive success become more common over generations."]
    ],
    sections: [
      {
        title: "Variation within a population",
        body: "Individuals in a population differ. Some variation is genetic and heritable; some is caused by environment; many characteristics reflect both. New genetic variation can arise through mutation, and sexual reproduction reshuffles alleles."
      },
      {
        title: "Selection across generations",
        body: "If a heritable trait helps individuals survive and reproduce in a particular environment, those individuals may leave more offspring. Their alleles can then become more common in later generations. Selection does not happen because organisms consciously choose to change."
      },
      {
        title: "Populations change over time",
        body: "An individual organism does not evolve during its lifetime in the biological sense. Evolution is a change in inherited characteristics or allele frequencies in populations across generations. Environmental conditions can change which traits are advantageous."
      }
    ],
    example: "If a pest population contains heritable variation in pesticide resistance, spraying can leave more resistant individuals alive to reproduce. Over generations, resistance may become more common, so careful pest management matters.",
    recap: "Natural selection requires variation, heritability, and differences in reproductive success. It changes the frequency of inherited traits in populations over generations.",
    watchOut: "Organisms do not develop a needed inherited trait simply because they need it. Selection acts on existing heritable variation; mutations are not directed by need."
  },
  "biology-disease": {
    objectives: [
      "Distinguish pathogens from other microorganisms.",
      "Describe basic immune defence and how vaccination helps."
    ],
    vocabulary: [
      ["Pathogen", "A biological agent that can cause disease."],
      ["Antigen", "A molecule recognised by the immune system."],
      ["Vaccine", "A preparation that trains immune responses against a pathogen or its components."]
    ],
    sections: [
      {
        title: "Infectious disease",
        body: "Viruses, bacteria, fungi, and protists can include disease-causing pathogens. They can spread through routes such as droplets, contaminated food or water, direct contact, or vectors. Prevention depends on the pathogen and may include hygiene, clean water, vaccination, and vector control."
      },
      {
        title: "The immune response",
        body: "The body has barriers such as skin and mucus, as well as immune cells and molecules that respond to pathogens. Some white blood cells produce antibodies that bind particular antigens. After exposure or vaccination, memory cells can help the body respond more quickly to a later encounter."
      },
      {
        title: "Malaria as an example",
        body: "Malaria is caused by Plasmodium parasites and transmitted by infected female Anopheles mosquitoes. Mosquito nets, reducing breeding sites, prompt testing, and appropriate treatment are among public-health approaches. A vaccine may help protect against malaria but does not replace other prevention."
      }
    ],
    example: "Vaccination exposes the immune system to a safe form or component associated with a pathogen. The immune system can build memory without requiring the person to experience the full disease.",
    recap: "Some microorganisms are pathogens. Immune defences recognise pathogens; vaccines train immune memory. Disease prevention uses several measures suited to how an infection spreads.",
    watchOut: "Antibiotics treat certain bacterial infections, not viral infections such as influenza. Medicines should be used only as directed by qualified health professionals."
  },
  "biology-ecology": {
    objectives: [
      "Interpret feeding relationships in a food web.",
      "Explain how conservation can protect biodiversity and ecosystem function."
    ],
    vocabulary: [
      ["Producer", "An organism, often a plant, that makes organic molecules using an energy source."],
      ["Consumer", "An organism that obtains energy by eating other organisms."],
      ["Decomposer", "An organism that breaks down dead material and waste, recycling nutrients."]
    ],
    sections: [
      {
        title: "Energy and feeding relationships",
        body: "Producers capture energy, usually from sunlight, and store it in organic molecules. Consumers obtain this energy by feeding. Decomposers break down dead material and release nutrients back into ecosystems. A food web links many food chains and shows that organisms can have several food sources."
      },
      {
        title: "Populations and balance",
        body: "A population's size can change with food supply, predators, disease, competition, and environmental conditions. Changes to one species can affect others. Ecosystems are dynamic, so a change does not always mean the system returns exactly to its previous state."
      },
      {
        title: "Conservation in Ghana",
        body: "Conservation aims to maintain biodiversity and ecosystem processes. Protecting forests, wetlands, coastal habitats, and wildlife corridors can benefit many species. Communities, research, sustainable resource use, and enforcement can all contribute to long-term conservation."
      }
    ],
    example: "If a wetland is drained, feeding and breeding habitats may be lost for birds, fish, and other organisms. Protecting the wetland can preserve several linked populations and ecosystem services at once.",
    recap: "Food webs describe connected feeding relationships and energy pathways. Conservation protects biodiversity, habitats, and the processes ecosystems depend on.",
    watchOut: "Energy flows through ecosystems and is eventually dissipated as heat; nutrients cycle and are reused. These are different patterns."
  }
};

for (const biologyLesson of branches.find((branch) => branch.id === "biology").lessons) {
  biologyLesson.learningNotes = biologyLearningNotes[biologyLesson.id];
  if (biologyLesson.id === "biology-classification") {
    biologyLesson.duration = "20 min";
  }
}

const STORAGE_KEY = "curious.completed-lessons";
const ACTIVE_SELECTION_KEY = "curious.active-selection";
const READER_LESSON_KEY = "curious.reader-lesson";
const branchPicker = document.querySelector("#branch-picker");
const learningLayout = document.querySelector(".learning-layout");
const lessonList = document.querySelector("#lesson-list");
const lessonContent = document.querySelector("#lesson-content");
const lessonCount = document.querySelector("#lesson-count");
const progressText = document.querySelector("#progress-text");
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");

const initialSelection = loadActiveSelection();
let activeBranchId = initialSelection.branch?.id || null;
let activeLessonId = initialSelection.lesson?.id || null;
let completedLessons = loadCompletedLessons();

function getLessons(branch) {
  if (branch.lessons) {
    return branch.lessons;
  }

  return [
    {
      id: branch.id,
      year: null,
      title: branch.title,
      duration: branch.duration,
      intro: branch.intro,
      fact: branch.fact,
      question: branch.question,
      options: branch.options,
      answer: branch.answer,
      explanation: branch.explanation
    }
  ];
}

function loadCompletedLessons() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const completed = new Set(
      Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : []
    );
    for (const branch of branches) {
      const firstLesson = getLessons(branch)[0];
      if (completed.has(branch.id) && firstLesson.id !== branch.id) {
        completed.delete(branch.id);
        completed.add(firstLesson.id);
      }
    }
    return completed;
  } catch (error) {
    console.error("Could not load saved lesson progress.", error);
    return new Set();
  }
}

function loadActiveSelection() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(ACTIVE_SELECTION_KEY) || "null");
    const branch = branches.find((item) => item.id === saved?.branchId);
    if (!branch) {
      return { branch: null, lesson: null };
    }
    const lesson =
      getLessons(branch).find((item) => item.id === saved?.lessonId) || getLessons(branch)[0];
    return { branch, lesson };
  } catch (error) {
    console.error("Could not restore the selected lesson.", error);
    return { branch: null, lesson: null };
  }
}

function saveCompletedLessons() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedLessons]));
  } catch (error) {
    console.error("Could not save lesson progress.", error);
  }
}

function renderBranches() {
  branchPicker.replaceChildren();

  for (const branch of branches) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "branch-card";
    button.setAttribute("aria-pressed", String(branch.id === activeBranchId));
    button.innerHTML = `
      <span class="branch-icon" aria-hidden="true">${branch.icon}</span>
      <span>
        <span class="branch-name">${branch.name}</span>
        <span class="branch-description">${branch.summary}</span>
      </span>
    `;
    button.addEventListener("click", () => {
      activeBranchId = branch.id;
      activeLessonId = getLessons(branch)[0].id;
      render();
    });
    branchPicker.append(button);
  }
}

function renderLessonList(branch) {
  const creditState = window.CuriousBoosterCredits?.state;
  const unlockedLessonIds = creditState?.unlockedLessonIds || new Set();
  const lessons = [...getLessons(branch)].sort((first, second) => {
    if (!first.year || !second.year) {
      return 0;
    }
    return Number(first.year.replace("Year ", "")) - Number(second.year.replace("Year ", ""));
  });
  const years = new Set(lessons.map((lesson) => lesson.year).filter(Boolean));
  lessonCount.textContent = years.size
    ? `${lessons.length} lessons · ${years.size} years`
    : `${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}`;
  lessonList.replaceChildren();

  let lastYear = null;
  let sequenceInYear = 0;
  lessons.forEach((lesson, index) => {
    if (lesson.year && lesson.year !== lastYear) {
      const heading = document.createElement("h3");
      heading.className = "year-heading";
      heading.textContent = lesson.year;
      lessonList.append(heading);
      lastYear = lesson.year;
      sequenceInYear = 0;
    }
    sequenceInYear += 1;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-link";
    button.setAttribute("aria-current", String(lesson.id === activeLessonId));
    const complete = completedLessons.has(lesson.id);
    const unlocked = unlockedLessonIds.has(lesson.id);
    button.classList.toggle("is-locked", !unlocked);
    button.innerHTML = `
      <span class="lesson-number" aria-label="${complete ? "Completed" : `Lesson ${lesson.year ? sequenceInYear : index + 1}`}">${complete ? "✓" : String(lesson.year ? sequenceInYear : index + 1).padStart(2, "0")}</span>
      <span>
        <span class="lesson-link-title">${lesson.title}</span>
        <span class="lesson-link-meta">${lesson.code ? "CODING EXTRA · " : ""}${lesson.duration}${lesson.year ? ` · ${lesson.year}` : ""}</span>
      </span>
      <span class="lesson-lock-indicator" aria-label="${unlocked ? "Unlocked" : "Costs 1 credit"}">${unlocked ? "✓" : "1 cr"}</span>
    `;
    button.addEventListener("click", () => {
      activeLessonId = lesson.id;
      render();
    });
    lessonList.append(button);
  });

  const completedCount = lessons.filter((lesson) => completedLessons.has(lesson.id)).length;
  progressText.textContent = `${completedCount} of ${lessons.length} done`;
  progressTrack.setAttribute("aria-valuemax", String(lessons.length));
  progressTrack.setAttribute("aria-valuenow", String(completedCount));
  progressFill.style.width = `${(completedCount / lessons.length) * 100}%`;
}

function renderLesson(lesson, branch) {
  const credits = window.CuriousBoosterCredits?.state;
  const unlocked = credits?.unlockedLessonIds.has(lesson.id) || false;
  const buttonText = unlocked
    ? "Read full lesson"
    : credits?.user
      ? credits.credits > 0 ? "Unlock with 1 credit and read" : "Buy credits to unlock";
      : "Sign in to unlock this lesson";
  lessonContent.innerHTML = `
    <div class="lesson-meta">
      <span class="subject-tag">${branch.name.toUpperCase()}</span>
      ${lesson.year ? `<span class="year-tag">${lesson.year}</span>` : ""}
      <span class="time-tag">◷ ${lesson.duration} read</span>
    </div>
    <h2>${lesson.title}</h2>
    <p class="lesson-intro">${lesson.intro}</p>
    <a class="read-lesson-button" id="read-lesson-button" href="lesson.html">${buttonText} <span aria-hidden="true">→</span></a>
    <p class="reader-error" id="reader-error" role="alert"></p>
  `;

  const readLessonButton = lessonContent.querySelector("#read-lesson-button");
  readLessonButton.addEventListener("click", async (event) => {
    event.preventDefault();
    readLessonButton.setAttribute("aria-disabled", "true");
    readLessonButton.classList.add("is-loading");
    const errorMessage = lessonContent.querySelector("#reader-error");
    errorMessage.textContent = "";
    try {
      await window.CuriousBoosterCredits.unlock(lesson.id);
      sessionStorage.setItem(
        ACTIVE_SELECTION_KEY,
        JSON.stringify({ branchId: branch.id, lessonId: lesson.id })
      );
      sessionStorage.setItem(
        READER_LESSON_KEY,
        JSON.stringify({ branchName: branch.name, lesson })
      );
      readLessonButton.removeAttribute("aria-disabled");
      readLessonButton.classList.remove("is-loading");
      window.location.assign("lesson.html");
    } catch (error) {
      console.error("Could not unlock or open the lesson.", error);
      errorMessage.textContent = error.message ||
        "The lesson could not be unlocked. Please check your connection and try again.";
      readLessonButton.removeAttribute("aria-disabled");
      readLessonButton.classList.remove("is-loading");
      if (error.code === "INSUFFICIENT_CREDITS") {
        document.querySelector("#account-panel").scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

}

function render() {
  const activeBranch = branches.find((branch) => branch.id === activeBranchId);
  renderBranches();
  learningLayout.hidden = !activeBranch;
  if (!activeBranch) {
    return;
  }
  const activeLesson = getLessons(activeBranch).find((lesson) => lesson.id === activeLessonId);
  renderLessonList(activeBranch);
  renderLesson(activeLesson, activeBranch);
}

render();
window.addEventListener("curiousbooster:creditschange", () => render());
