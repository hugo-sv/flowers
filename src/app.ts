// Constants

const numberOfGenes: number = 8;
const maxNumberOfFlowers: number = 30;
const archiveText: string = "x";
const starredText: string = "★";
const unStarredText: string = "☆";
const checkedText: string = "☑";
const unCheckedText: string = "☐";

type Achievement = {
  dependsOn: string[];
  description: string;
  objective?: number;
  flowerIds?: number[];
};

const achievements: { [tag: string]: Achievement } = {
  buy: {
    dependsOn: [],
    description:
      "<b>Buy flowers.</b> Not all flowers can be found on the market.",
  },
  breed: {
    dependsOn: ["buy"],
    description:
      "<b>Select two flowers and breed them.</b> Up to 30 flowers can be stored.",
  },
  archive: {
    dependsOn: ["buy"],
    description:
      "<b>Archive flowers.</b> They can't be used for further breeding.",
  },
  tree: {
    dependsOn: ["breed"],
    description: "<b>Open a family tree</b> by clicking on a flower.",
  },
  mutationLeaf: {
    dependsOn: ["tree"],
    description:
      "<b>Observe bigger leaves</b>, indicating a mutation has occurred.",
  },
  mutation: {
    dependsOn: ["mutationLeaf"],
    description:
      "Observe a trait that can only be caused by a <b>mutation</b>.",
  },
  recessive: {
    dependsOn: ["tree"],
    description: "Observe an <b>autosomal recessive trait transmission</b>.",
  },
  simplest: {
    dependsOn: ["buy"],
    description: "Find the <b>most common flower</b>.",
  },
  hardest: {
    dependsOn: ["mutation"],
    description: "Make the <b>most rare flower</b>.",
  },
  traits: {
    dependsOn: ["breed"],
    description: "Observe <b>all flower traits</b>.",
    objective: 2 * numberOfGenes,
  },
  recessivePlant: {
    dependsOn: ["recessive"],
    description: "Make a flower with <b>only recessive traits</b>.",
  },
  dominantPlant: {
    dependsOn: ["recessive"],
    description: "Make a flower with <b>only dominant traits</b>.",
  },
  allPlants: {
    dependsOn: ["simplest", "breed"],
    description: "Observe <b>all possible flowers</b>.",
    objective: 2 ** numberOfGenes,
  },
  proveRecessive0: {
    dependsOn: ["allPlants"],
    description:
      "Prove having <b>darker inner petals</b> is a <b>recessive</b> trait.",
  },
  proveRecessive1: {
    dependsOn: ["allPlants"],
    description:
      "Prove having <b>orange outer petals</b> is a <b>recessive</b> trait.",
  },
  proveRecessive2: {
    dependsOn: ["allPlants"],
    description:
      "Prove having <b>doubled petals</b> is a <b>recessive</b> trait.",
  },
  proveRecessive3: {
    dependsOn: ["allPlants"],
    description:
      "Prove having <b>bigger inner petals</b> is a <b>recessive</b> trait.",
  },
  proveRecessive4: {
    dependsOn: ["allPlants"],
    description:
      "Prove having <b>rougher petal edges</b> is a <b>recessive</b> trait.",
  },
  proveRecessive5: {
    dependsOn: ["allPlants"],
    description:
      "Prove having <b>lighter pistil</b> is a <b>recessive</b> trait.",
  },
  proveRecessive6: {
    dependsOn: ["allPlants"],
    description:
      "Prove having <b>purple middle petals</b> is a <b>recessive</b> trait.",
  },
  proveRecessive7: {
    dependsOn: ["allPlants"],
    description: "Prove <b>blooming at night<b> is a <b>recessive</b> trait.",
  },
};

// Random
const Try = (chances: number): boolean => {
  return Math.random() <= chances;
};
const InheritA = (): number => {
  return 0.5;
};
const Mutate = (): number => {
  return 0.007;
};
const Dominant = (i: number, isSecondSet: boolean): number => {
  switch (i) {
    case 2:
      return 0.134;
    case 3:
      return 0.3;
    case 4:
      return 0.5;
    case 5:
      return isSecondSet ? 0.1 : 1;
    case 6:
      return isSecondSet ? 0.66 : 1;
    case 7:
      return 1;
    default:
      return 0;
  }
};
const RecessiveIsRarer = (i: number): boolean => {
  return (1 - Dominant(i, false)) * (1 - Dominant(i, true)) < 0.5;
};

class ChromosomeSet {
  value: boolean[] = new Array(numberOfGenes);
  hasMutated: boolean = false;

  public static Buy(isSecondSet: boolean): ChromosomeSet {
    const c = new ChromosomeSet();
    for (let i: number = 0; i < numberOfGenes; i++) {
      c.value[i] = Try(Dominant(i, isSecondSet));
    }
    return c;
  }
  public static Breed(A: ChromosomeSet, B: ChromosomeSet): ChromosomeSet {
    const c = new ChromosomeSet();
    for (let i: number = 0; i < numberOfGenes; i++) {
      c.value[i] = (Try(InheritA()) ? A : B).get(i);
      if (A.get(i) == B.get(i) && Try(Mutate())) {
        c.value[i] = !c.value[i];
        c.hasMutated = true;
      }
    }
    return c;
  }
  public static FromJson(data: any): ChromosomeSet {
    const c = new ChromosomeSet();
    c.value = data.value;
    c.hasMutated = data.hasMutated;
    return c;
  }
  get(i: number): boolean {
    return this.value[i];
  }
}

class Genome {
  set1: ChromosomeSet = new ChromosomeSet();
  set2: ChromosomeSet = new ChromosomeSet();

  public static Buy(): Genome {
    const g = new Genome();
    g.set1 = ChromosomeSet.Buy(false);
    g.set2 = ChromosomeSet.Buy(true);
    return g;
  }
  public static Breed(A: Genome, B: Genome): Genome {
    const g = new Genome();
    g.set1 = ChromosomeSet.Breed(A.set1, A.set2);
    g.set2 = ChromosomeSet.Breed(B.set1, B.set2);
    return g;
  }
  public static FromJson(data: any): Genome {
    const g = new Genome();
    g.set1 = ChromosomeSet.FromJson(data.set1);
    g.set2 = ChromosomeSet.FromJson(data.set2);
    return g;
  }
  hasMutated(): boolean {
    return this.set1.hasMutated || this.set2.hasMutated;
  }
  visualID(): number {
    let result: number = 0;
    for (let i: number = numberOfGenes - 1; i >= 0; i--) {
      result *= 2;
      result += this.get(i) == RecessiveIsRarer(i) ? 0 : 1;
    }
    return result;
  }
  get(i: number): boolean {
    return this.set1.value[i] || this.set2.value[i];
  }
  isRarest(): boolean {
    for (let i: number = 0; i < numberOfGenes; i++) {
      if (this.get(i) == RecessiveIsRarer(i)) {
        return false;
      }
    }
    return true;
  }
  isMostCommon(): boolean {
    for (let i: number = 0; i < numberOfGenes; i++) {
      if (this.get(i) != RecessiveIsRarer(i)) {
        return false;
      }
    }
    return true;
  }
  isAllRecessive(): boolean {
    for (let i: number = 0; i < numberOfGenes; i++) {
      if (this.get(i)) {
        return false;
      }
    }
    return true;
  }
  isAllDominant(): boolean {
    for (let i: number = 0; i < numberOfGenes; i++) {
      if (!this.get(i)) {
        return false;
      }
    }
    return true;
  }
}

class Flower {
  id: number = 0;
  parent1: number = 0;
  parent2: number = 0;
  genome: Genome = new Genome();
  archived: boolean = false;
  starred: boolean = false;

  public static Buy(): Flower {
    const f = new Flower();
    f.id = incrementLastID();
    f.genome = Genome.Buy();
    return f;
  }
  public static Breed(A: Flower, B: Flower): Flower {
    const f = new Flower();
    f.id = incrementLastID();
    f.parent1 = A.id;
    f.parent2 = B.id;
    f.genome = Genome.Breed(A.genome, B.genome);
    return f;
  }
  public static FromJson(data: any): Flower {
    const f = new Flower();
    f.id = data.id;
    f.parent1 = data.parent1;
    f.parent2 = data.parent2;
    f.genome = Genome.FromJson(data.genome);
    f.archived = data.archived;
    f.starred = data.starred;
    return f;
  }
  hasMutated(): boolean {
    return this.genome.hasMutated();
  }
  visualID(): number {
    return this.genome.visualID();
  }
  public static MaxVisualID(): number {
    return 2 ** numberOfGenes;
  }
  get(i: number): boolean {
    return this.genome.get(i);
  }
  isRarest(): boolean {
    return this.genome.isRarest();
  }
  isMostCommon(): boolean {
    return this.genome.isMostCommon();
  }
  isAllRecessive(): boolean {
    return this.genome.isAllRecessive();
  }
  isAllDominant(): boolean {
    return this.genome.isAllDominant();
  }
  log(): void {
    console.log(JSON.stringify(this));
  }
}

// Non-saved data

let familyTreeFlower: number = 0;
let selectedFlowers: [number, number] = [0, 0];
let displayUnknownFLowers: boolean = false;

// Storage data

/// Flowers

let flowers: Flower[] = [];
{
  const value: string | null = localStorage.getItem("flowers");
  if (!value) {
    localStorage.setItem("flowers", JSON.stringify(flowers));
  } else {
    flowers = JSON.parse(value).map((data: string) => Flower.FromJson(data));
  }
}

const updateFlowers = async () => {
  localStorage.setItem("flowers", JSON.stringify(flowers));
};

const addFlower = (flower: Flower) => {
  flowers.push(flower);
  updateFlowers();
};

/// LastID

let lastID: number = 0;
{
  const value: string | null = localStorage.getItem("lastID");
  if (!value) {
    localStorage.setItem("lastID", JSON.stringify(lastID));
  } else {
    lastID = JSON.parse(value);
  }
}

const updateLastID = async () => {
  localStorage.setItem("lastID", JSON.stringify(lastID));
};

const incrementLastID = (): number => {
  lastID += 1;
  updateLastID();
  return lastID;
};

/// AchievementsCount

type AchievementsCount = {
  [tag: string]: number;
};

const updateAchievementsCount = async () => {
  localStorage.setItem("achievementsCount", JSON.stringify(achievementsCount));
};

let achievementsCount: AchievementsCount = {};
{
  const value: string | null = localStorage.getItem("achievementsCount");
  if (!value) {
    Object.keys(achievements).map((key: string) => {
      achievementsCount[key] = 0;
    });
    localStorage.setItem(
      "achievementsCount",
      JSON.stringify(achievementsCount)
    );
  } else {
    achievementsCount = JSON.parse(value);
    let updateAchievements: boolean = false;
    Object.keys(achievements).map((key: string) => {
      if (achievementsCount[key] === undefined) {
        achievementsCount[key] = 0;
        updateAchievements = true;
      }
    });
    if (updateAchievements) {
      updateAchievementsCount();
    }
  }
}

const incrementAchievement = (tag: string) => {
  achievementsCount[tag] += 1;
  updateAchievementsCount();
};

/// AchievementsExample

type AchievementsExample = {
  [tag: string]: number;
};

const updateAchievementsExample = async () => {
  localStorage.setItem(
    "achievementsExample",
    JSON.stringify(achievementsExample)
  );
};

let achievementsExample: AchievementsExample = {};
{
  const value: string | null = localStorage.getItem("achievementsExample");
  if (!value) {
    Object.keys(achievements).map((key: string) => {
      achievementsExample[key] = 0;
    });
    localStorage.setItem(
      "achievementsExample",
      JSON.stringify(achievementsExample)
    );
  } else {
    achievementsExample = JSON.parse(value);
    let updateAchievements: boolean = false;
    Object.keys(achievements).map((key: string) => {
      if (achievementsExample[key] === undefined) {
        achievementsExample[key] = 0;
        updateAchievements = true;
      }
    });
    if (updateAchievements) {
      updateAchievementsExample();
    }
  }
}

const setAchievementExample = (tag: string, flowerId: number) => {
  achievementsExample[tag] = flowerId;
  updateAchievementsExample();
};

// Trait count

let recessiveCount: boolean[] = [];
{
  const value: string | null = localStorage.getItem("recessiveCount");
  if (!value) {
    for (let i: number = 0; i < numberOfGenes; i++) {
      recessiveCount.push(false);
    }
    localStorage.setItem("recessiveCount", JSON.stringify(recessiveCount));
  } else {
    recessiveCount = JSON.parse(value);
  }
}

let dominantCount: boolean[] = [];
{
  const value: string | null = localStorage.getItem("dominantCount");
  if (!value) {
    for (let i: number = 0; i < numberOfGenes; i++) {
      dominantCount.push(false);
    }
    localStorage.setItem("dominantCount", JSON.stringify(dominantCount));
  } else {
    dominantCount = JSON.parse(value);
  }
}

const updateTraitCount = async () => {
  localStorage.setItem("recessiveCount", JSON.stringify(recessiveCount));
  localStorage.setItem("dominantCount", JSON.stringify(dominantCount));
};

/// Database access

const achievementDone = (tag: string): boolean => {
  let objective = 1;
  if (achievements[tag].objective !== undefined) {
    objective = achievements[tag].objective;
  }
  return achievementsCount[tag] >= objective;
};

const achievementCompletion = (tag: string): number => {
  return (
    achievementsCount[tag] /
    (achievements[tag].objective ? achievements[tag].objective : 1)
  );
};

const achievementVisible = (tag: string): boolean => {
  if (achievementDone(tag)) {
    return true;
  }
  for (const tagDependency of achievements[tag].dependsOn) {
    if (!achievementDone(tagDependency)) {
      return false;
    }
  }
  return true;
};

const parentsCanBreed = (): boolean => {
  if (selectedFlowers[0] == selectedFlowers[1]) {
    return false;
  }
  const parent1 = flowerForId(selectedFlowers[0]);
  if (parent1 === undefined || parent1.archived) {
    return false;
  }
  const parent2 = flowerForId(selectedFlowers[1]);
  return parent2 !== undefined && !parent2.archived;
};

const isSelectedForBreeding = (id: number): boolean => {
  return id == selectedFlowers[0] || id == selectedFlowers[1];
};

const flowerForId = (id: number): Flower | undefined => {
  return flowers.find((flower) => flower.id == id);
};

const plantsInGreenhouse = (): number => {
  return flowers.reduce((count: number, flower: Flower): number => {
    return flower.archived ? count : count + 1;
  }, 0);
};

const maxPlantsInGreenHouse = (): boolean => {
  return plantsInGreenhouse() >= maxNumberOfFlowers;
};

// Actions

const switchEncyclopediaDisplay = (): void => {
  displayUnknownFLowers = !displayUnknownFLowers;
  updateEncyclopedia();
};

const buy = (): void => {
  if (maxPlantsInGreenHouse()) {
    return;
  }
  const flower = Flower.Buy();
  addFlower(flower);
  incrementAchievement("buy");
  if (flower.isMostCommon()) {
    incrementAchievement("simplest");
    setAchievementExample("simplest", flower.id);
  }
  for (let i: number = 0; i < numberOfGenes; i++) {
    if (flower.get(i)) {
      if (!dominantCount[i]) {
        incrementAchievement("traits");
        dominantCount[i] = true;
        updateTraitCount();
      }
    } else {
      if (!recessiveCount[i]) {
        incrementAchievement("traits");
        recessiveCount[i] = true;
        updateTraitCount();
      }
    }
  }
  updateGreenhouse();
  updateEncyclopedia();
  // updateAchievements();
};

const displayTreeForAchievement = (tag: string): void => {
  if (familyTreeFlower != achievementsExample[tag]) {
    familyTreeFlower = achievementsExample[tag];
    updateFamilyTree();
  }
};

const displayFamilyTree = (id: number): void => {
  incrementAchievement("tree");
  updateAchievements();
  if (familyTreeFlower != id) {
    familyTreeFlower = id;
    updateGreenhouse();
    updateFamilyTree();
  }
};

const selectForBreeding = (id: number): void => {
  if (selectedFlowers[1] == id) {
    selectedFlowers[1] = selectedFlowers[0];
    selectedFlowers[0] = 0;
  } else if (selectedFlowers[0] == id) {
    selectedFlowers[0] = 0;
  } else {
    selectedFlowers[0] = selectedFlowers[1];
    selectedFlowers[1] = id;
  }
  updateGreenhouse();
};

const canBreed = (): boolean => {
  return (
    !maxPlantsInGreenHouse() &&
    flowerForId(selectedFlowers[0]) !== undefined &&
    flowerForId(selectedFlowers[1]) !== undefined
  );
};

const breed = (): void => {
  if (!canBreed()) {
    return;
  }
  const parent1 = flowerForId(selectedFlowers[0]);
  const parent2 = flowerForId(selectedFlowers[1]);
  if (!parent1 || !parent2) {
    return;
  }
  const flower = Flower.Breed(parent1, parent2);
  addFlower(flower);
  incrementAchievement("breed");
  if (flower.isMostCommon()) {
    incrementAchievement("simplest");
    setAchievementExample("simplest", flower.id);
  } else if (flower.isRarest()) {
    incrementAchievement("hardest");
    setAchievementExample("hardest", flower.id);
  } else if (flower.isAllDominant()) {
    incrementAchievement("dominantPlant");
    setAchievementExample("dominantPlant", flower.id);
  } else if (flower.isAllRecessive()) {
    incrementAchievement("recessivePlant");
    setAchievementExample("recessivePlant", flower.id);
  }
  if (flower.hasMutated()) {
    incrementAchievement("mutationLeaf");
    setAchievementExample("mutationLeaf", flower.id);
  }
  for (let i: number = 0; i < numberOfGenes; i++) {
    if (flower.get(i)) {
      if (!dominantCount[i]) {
        incrementAchievement("traits");
        dominantCount[i] = true;
        updateTraitCount();
      }
    } else {
      if (!recessiveCount[i]) {
        incrementAchievement("traits");
        recessiveCount[i] = true;
        updateTraitCount();
      }
    }
    if (parent1.get(i) == parent2.get(i) && parent1.get(i) != flower.get(i)) {
      // Flower has a trait that neither parents had
      if (flower.get(i)) {
        if (achievementDone("proveRecessive" + i)) {
          incrementAchievement("mutation");
          setAchievementExample("mutation", flower.id);
        }
      } else {
        incrementAchievement("recessive");
        setAchievementExample("recessive", flower.id);
        if (!flower.hasMutated()) {
          incrementAchievement("proveRecessive" + i);
          setAchievementExample("proveRecessive" + i, flower.id);
        }
      }
    }
  }
  familyTreeFlower = flower.id;
  updateFamilyTree();
  updateGreenhouse();
  // updateAchievements();
  updateEncyclopedia();
};

const star = (id: number): void => {
  let flower = flowerForId(id);
  if (flower === undefined) {
    return;
  }
  flower.starred = !flower.starred;
  updateFlowers();
  updateGreenhouse();
};

const protectFromArchive = (flower: Flower): boolean => {
  return (
    flower.starred ||
    isSelectedForBreeding(flower.id) ||
    flower.id == familyTreeFlower
  );
};

const archive = (id: number): void => {
  let flower = flowerForId(id);
  if (flower === undefined) {
    return;
  }
  flower.archived = true;
  incrementAchievement("archive");
  updateFlowers();
  updateGreenhouse();
  updateAchievements();
};

const archiveDuplicates = (): void => {
  var activeCollection: { [visualID: number]: boolean } = {};
  // Mark starred and selected flowers first (they can't be deleted)
  flowers
    .filter((flower) => {
      return !flower.archived && protectFromArchive(flower);
    })
    .forEach((flower) => {
      const visualID: number =
        flower.visualID() + (flower.hasMutated() ? Flower.MaxVisualID() : 0);
      activeCollection[visualID] = true;
    });
  flowers.forEach((flower) => {
    if (!flower.archived && !protectFromArchive(flower)) {
      const visualID: number =
        flower.visualID() + (flower.hasMutated() ? Flower.MaxVisualID() : 0);
      if (visualID in activeCollection) {
        flower.archived = true;
        incrementAchievement("archive");
      } else {
        activeCollection[visualID] = true;
      }
    }
  });
  updateFlowers();
  updateGreenhouse();
  updateAchievements();
};

// DOM

const emptyFlowerHTML = (): string => {
  return `<div class="flower" style="--skyColor: lightgrey;"></div>`;
};

const flowerHTML = (flower: Flower, archived: boolean): string => {
  const mutated: boolean = flower.hasMutated();
  const numberOfPetals: number = flower.get(2) ? 6 : 5;
  const nerves: string = `
    <div class="nerve secondary right" style="--position: -10%"></div>
    <div class="nerve secondary right" style="--position: -35%"></div>
    <div class="nerve secondary right" style="--position: -60%"></div>
    <div class="nerve secondary right" style="--position: -85%"></div>
    <div class="nerve secondary left" style="--position: -5%"></div>
    <div class="nerve secondary left" style="--position: -30%"></div>
    <div class="nerve secondary left" style="--position: -55%"></div>
    <div class="nerve secondary left" style="--position: -80%"></div>
    <div class="nerve main"></div>`;

  const displayStem: string = archived ? `none` : `initial`;
  const displayRightLeaf: string = archived || !mutated ? `none` : `initial`;
  // Traits
  const centerColor: string = flower.get(5) ? `#ab5302` : `#ffc75f`;
  const petalColor1: string = flower.get(0) ? `#845ec2` : `#6A2C70`;
  const petalColor2: string = flower.get(6) ? `#B83B5E` : `#b39cd0`;
  const petalColor3: string = flower.get(1) ? `#fbeaff` : `#F08A5D`;
  const skyColor: string = flower.get(7) ? `skyblue` : `#061558`;
  const globalFilter: string = flower.get(7)
    ? `none`
    : `drop-shadow(0px 0px 20px)`;
  const doubledPetals: boolean = !flower.get(2);
  const otherBorder: boolean = flower.get(4);
  const otherShape: boolean = !flower.get(3);
  const petalBorder1: string = otherBorder
    ? `50% 50% 50% 50%`
    : `50% 50% 50% 20%`;
  const petalBorder2: string = otherBorder
    ? `50% 50% 50% 50%`
    : `50% 50% 50% 20%`;
  const petalBorder3: string = otherBorder
    ? `50% 50% 50% 50%`
    : `50% 50% 30% 30%`;
  const centerSize: string = otherShape ? `16%` : `12%`;
  const petalWidth1: string = otherShape ? `10%` : `8%`;
  const petalHeight1: string = otherShape ? `25%` : `18%`;
  const petalWidth2: string = otherShape ? `23%` : `18%`;
  const petalHeight2: string = otherShape ? `35%` : `38%`;
  const petalWidth3: string = otherShape ? `23%` : `28%`;
  const petalHeight3: string = otherShape ? `45%` : `42%`;

  let output: string = `
    <div class="flower" style="
      --displayStem: ${displayStem};
      --displayRightLeaf: ${displayRightLeaf};    
      --centerColor: ${centerColor};
      --petalColor1: ${petalColor1};
      --petalColor2: ${petalColor2};
      --petalColor3: ${petalColor3};
      --petalBorder1: ${petalBorder1};
      --petalBorder2: ${petalBorder2};
      --petalBorder3: ${petalBorder3};
      --centerSize: ${centerSize};
      --petalWidth1: ${petalWidth1};
      --petalHeight1: ${petalHeight1};
      --petalWidth2: ${petalWidth2};
      --petalHeight2: ${petalHeight2};
      --petalWidth3: ${petalWidth3};
      --petalHeight3: ${petalHeight3};
      --skyColor: ${skyColor};
      --globalFilter:${globalFilter};"
      onClick="displayFamilyTree(${flower.id})">
      <div class="stem"></div>
      <div class="leaf left">${nerves}</div>
      <div class="leaf right">${nerves}</div>`;

  let petal1: string = ``;
  let petal1bis: string = ``;
  let petal2: string = ``;
  let petal2bis: string = ``;
  let petal3: string = ``;
  let petal3bis: string = ``;
  let angle: number = 45;
  const step: number = 360 / numberOfPetals;
  const moving: boolean = !flower.archived && achievementDone("allPlants");
  for (let index = 0; index < numberOfPetals; index++) {
    const otherAngle = angle - step / 2;
    petal1 += `<div class="petal style1${
      moving ? ` moving` : ``
    }" style="--rotation: ${otherShape ? angle : otherAngle}deg;${
      moving ? `--delay: ${Math.random()}s;` : ``
    }"></div>`;
    petal2 += `<div class="petal style2${
      moving ? ` moving` : ``
    }" style="--rotation: ${otherShape ? angle : otherAngle}deg;${
      moving ? `--delay: ${Math.random()}s;` : ``
    }"></div>`;
    petal3 += `<div class="petal style3${
      moving ? ` moving` : ``
    }" style="--rotation: ${otherAngle}deg;${
      moving ? `--delay: ${Math.random()}s;` : ``
    }"></div>`;
    if (doubledPetals) {
      petal1bis += `<div class="petal style1${
        moving ? ` moving` : ``
      }" style="--rotation: ${otherShape ? otherAngle : angle}deg;${
        moving ? `--delay: ${Math.random()}s;` : ``
      }"></div>`;
      petal2bis += `<div class="petal style2${
        moving ? ` moving` : ``
      }" style="--rotation: ${otherShape ? otherAngle : angle}deg;${
        moving ? `--delay: ${Math.random()}s;` : ``
      }"></div>`;
      petal3bis += `<div class="petal style3${
        moving ? ` moving` : ``
      }" style="--rotation: ${angle}deg;${
        moving ? `--delay: ${Math.random()}s;` : ``
      }"></div>`;
    }
    angle += step;
  }
  output += petal3bis;
  output += petal3;
  output += petal2bis;
  output += petal2;
  output += petal1bis;
  output += petal1;
  output += `<div class="center"></div>`;
  output += `</div>`;
  return output;
};

const flowerCardHTML = (flower: Flower): string => {
  return `
<div class="card">
  <div class="buttonRow flowerButtonRow">
    <button class="btn" onClick="selectForBreeding(${flower.id})">
    ${isSelectedForBreeding(flower.id) ? checkedText : unCheckedText}
    </button>
    <button class="btn" onClick="star(${flower.id})">
    ${flower.starred ? starredText : unStarredText}
    </button>
    <button class="btn" type="button" 
    ${
      protectFromArchive(flower)
        ? `disabled`
        : `onClick="archive(${flower.id})"`
    }>${archiveText}</button>
  </div>
  ${flowerHTML(flower, false)}
</div>`;
};

const appendAchievementCardHTML = (
  container: HTMLElement,
  tag: string
): void => {
  const achievement: Achievement = achievements[tag];
  const count: number = achievementsCount[tag];
  const completion: number =
    Math.min(Math.max(achievementCompletion(tag), 0), 1) * 100;
  const achievementCanBeClicked: boolean = achievementsExample[tag] != 0;
  const hasObjective: boolean = achievement.objective !== undefined;
  let output: string = `
  <div class="achievement${
    achievementCanBeClicked ? " achievementHoverable" : ""
  }" 
       style="--percent: ${completion}%;"
       ${
         achievementCanBeClicked
           ? `onClick=displayTreeForAchievement('${tag}')`
           : ``
       }
       >
    <span>${achievement.description}</span>
    <span>${count}${hasObjective ? "/" + achievement.objective : ""}</span>
  </div>`;
  container.innerHTML += output;
};

const updateGreenhouse = async () => {
  const container: HTMLElement | any = document.getElementById("greenhouse");
  // TODO: disable buttons if too many plants
  const maxPlants: boolean = maxPlantsInGreenHouse();
  const cantBreed: boolean = maxPlants || !canBreed();
  let result: string = `
<div class="buttonRow greenhouseButtonRow">
  <button class="btn" type="button" ${
    maxPlants ? `disabled` : `onClick="buy()"`
  }>Buy</button>
  <button class="btn" type="button" ${
    cantBreed ? `disabled` : `onClick="breed()"`
  }>Breed</button>
  <button class="btn" onClick="archiveDuplicates()">Archive duplicates</button>
</div>
<div class="grid-container-3">`;
  flowers
    .filter((flower) => !flower.archived)
    .forEach((flower) => {
      result += flowerCardHTML(flower);
    });
  result += `
</div>`;
  container.innerHTML = result;
};

const updateFamilyTree = async () => {
  const container: HTMLElement | any = document.getElementById("family-tree");
  container.innerHTML = ``;
  let child: Flower | undefined = flowerForId(familyTreeFlower);
  if (child === undefined) {
    return;
  }
  let parent1: Flower | undefined = flowerForId(child.parent1);
  let parent11: Flower | undefined =
    parent1 === undefined ? undefined : flowerForId(parent1.parent1);
  let parent12: Flower | undefined =
    parent1 === undefined ? undefined : flowerForId(parent1.parent2);
  let parent2: Flower | undefined = flowerForId(child.parent2);
  let parent21: Flower | undefined =
    parent2 === undefined ? undefined : flowerForId(parent2.parent1);
  let parent22: Flower | undefined =
    parent2 === undefined ? undefined : flowerForId(parent2.parent2);
  let result: string = `
<div class="familyTreeRow">
  <div class="parent11">${
    parent11 === undefined ? emptyFlowerHTML() : flowerHTML(parent11, false)
  }</div>
  <div class="parent12">${
    parent12 === undefined ? emptyFlowerHTML() : flowerHTML(parent12, false)
  }</div>
  <div class="parent21">${
    parent21 === undefined ? emptyFlowerHTML() : flowerHTML(parent21, false)
  }</div>
  <div class="parent22">${
    parent22 === undefined ? emptyFlowerHTML() : flowerHTML(parent22, false)
  }</div>
  <div class="parent1">${
    parent1 === undefined ? emptyFlowerHTML() : flowerHTML(parent1, false)
  }</div>
  <div class="parent2">${
    parent2 === undefined ? emptyFlowerHTML() : flowerHTML(parent2, false)
  }</div>
  <div class="child">${
    child === undefined ? emptyFlowerHTML() : flowerHTML(child, false)
  }</div>
</div>`;
  container.innerHTML = result;
};

const updateEncyclopedia = async () => {
  const container: HTMLElement | any = document.getElementById("encyclopedia");
  let dict: { [visualD: number]: Flower } = {};
  // Set flowers backward so the first specimen found is displayed in family tree
  for (let index = flowers.length - 1; index >= 0; index--) {
    const flower: Flower = flowers[index];
    dict[flower.visualID()] = flower;
  }
  achievementsCount["allPlants"] = Object.keys(dict).length;
  let result: string = ``;
  if (achievementsCount["allPlants"] >= 32) {
    result += `
    <div class="buttonRow greenhouseButtonRow">
    <div></div>
    <button class="btn" type="button" onClick="switchEncyclopediaDisplay()">${
      displayUnknownFLowers ? "Hide" : "Show"
    } all flowers</button>
    </div>`;
  }
  result += `<div class="grid-container-4">`;
  for (let index = 0; index < Flower.MaxVisualID(); index++) {
    if (index in dict) {
      result += `<div>${flowerHTML(dict[index], true)}</div>`;
    } else if (displayUnknownFLowers) {
      result += `<div>${emptyFlowerHTML()}</div>`;
    }
  }
  result += `</div>`;
  updateAchievementsCount();
  updateAchievements();
  container.innerHTML = result;
};

const updateAchievements = async () => {
  const container: HTMLElement | any = document.getElementById("achievements");
  container.innerHTML = ``;
  const containerDone: HTMLElement | any =
    document.getElementById("achievementsDone");
  containerDone.innerHTML = ``;
  // Trait identification achievements
  const visibleTraitAchievementTags: string[] = Object.keys(
    achievements
  ).filter((tag: string) => tag.includes("prove") && achievementDone(tag));
  visibleTraitAchievementTags.forEach((tag: string) => {
    appendAchievementCardHTML(containerDone, tag);
  });
  // Other achievements
  const visibleAchievementTags: string[] = Object.keys(achievements).filter(
    (tag: string) => !tag.includes("prove") && achievementVisible(tag)
  );
  // Sort achievements by completion
  visibleAchievementTags.sort(
    (a, b) => achievementCompletion(a) - achievementCompletion(b)
  );
  visibleAchievementTags.forEach((tag: string) => {
    appendAchievementCardHTML(
      achievementDone(tag) ? containerDone : container,
      tag
    );
  });
};

// Initialize DOM components

updateGreenhouse();
updateFamilyTree();
// updateAchievements();
updateEncyclopedia();
