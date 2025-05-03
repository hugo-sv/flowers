// Constants

const numberOfGenes: number = 8;
const maxNumberOfFlowers: number = 30;
const archiveText: string = "❌";
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
    description: "Buy plants.",
  },
  breed: {
    dependsOn: ["buy"],
    description: "Breed flowers.",
  },
  archive: {
    dependsOn: ["buy"],
    description: "Archive flowers.",
  },
  tree: {
    dependsOn: ["breed"],
    description: "Check a family tree.",
  },
  mutation: {
    dependsOn: ["tree"],
    description: "Observe a trait mutation.",
  },
  recessive: {
    dependsOn: ["tree"],
    description: "Observe a recessive trait.",
  },
  simplest: {
    dependsOn: ["buy"],
    description: "Find the simplest plant.",
  },
  hardest: {
    dependsOn: ["mutation"],
    description: "Make the hardest plant.",
  },
  traits: {
    dependsOn: ["breed"],
    description: "Find all traits.",
    objective: 2 * numberOfGenes,
  },
  recessivePlant: {
    dependsOn: ["recessive"],
    description: "Make a plant with only recessive traits.",
  },
  dominantPlant: {
    dependsOn: ["recessive"],
    description: "Make a plant with only dominant traits.",
  },
  allPlants: {
    dependsOn: ["simplest"],
    description: "Make all possible plants.",
    objective: 2 ** numberOfGenes,
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
  return 0.2;
};
const Dominant = (i: number): number => {
  return i / (numberOfGenes - 1);
};
const RecessiveIsRarer = (i: number): boolean => {
  return (1 - Dominant(i)) ** 2 < 0.5;
};

class ChromosomeSet {
  value: boolean[];
  hasMutated: boolean;
  constructor(A?: ChromosomeSet, B?: ChromosomeSet) {
    this.value = new Array(numberOfGenes);
    this.hasMutated = false;
    for (let i: number = 0; i < numberOfGenes; i++) {
      if (A && B) {
        this.value[i] = (Try(InheritA()) ? A : B).get(i);
        if (A.get(i) == B.get(i) && Try(Mutate())) {
          this.value[i] = !this.value[i];
          this.hasMutated = true;
        }
      } else {
        this.value[i] = Try(Dominant(i));
        Math.random() * (numberOfGenes - 1) <= i;
      }
    }
  }
  get(i: number): boolean {
    return this.value[i];
  }
}

class Genome {
  set1: ChromosomeSet;
  set2: ChromosomeSet;

  constructor(A?: Genome, B?: Genome) {
    if (A && B) {
      this.set1 = new ChromosomeSet(A.set1, A.set2);
      this.set2 = new ChromosomeSet(B.set1, B.set2);
    } else {
      this.set1 = new ChromosomeSet();
      this.set2 = new ChromosomeSet();
    }
  }
  hasMutated(): boolean {
    return this.set1.hasMutated || this.set2.hasMutated;
  }
  visualID(): number {
    let result: number = 0;
    for (let i: number = 0; i < numberOfGenes; i++) {
      result *= 2;
      result += this.get(i) ? 1 : 0;
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
  id: number;
  parent1: number;
  parent2: number;
  genome: Genome;
  archived: boolean;
  starred: boolean;

  constructor(A?: Flower, B?: Flower) {
    this.id = getLastID();
    this.archived = false;
    this.starred = false;
    if (A && B) {
      this.parent1 = A.id;
      this.parent2 = B.id;
      this.genome = new Genome(A.genome, B.genome);
    } else {
      this.parent1 = 0;
      this.parent2 = 0;
      this.genome = new Genome();
    }
  }
  hasMutated(): boolean {
    return this.genome.hasMutated();
  }
  visualID(): number {
    return this.genome.visualID();
  }
  hasVisibleMutation(): boolean {
    return false;
  }
  hasVisibleRecessive(): boolean {
    return false;
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
}

// Non-saved data

let familyTreeFlower: number = 0;
let selectedFlowers: [number, number] = [0, 0];

// Saved data

let recessiveCount: boolean[] = [];
let dominantCount: boolean[] = [];

for (let i: number = 0; i < numberOfGenes; i++) {
  recessiveCount.push(false);
  dominantCount.push(false);
}

let flowers: Flower[] = [];

const getFlowers = (): Flower[] => {
  return flowers;
};

const addFlower = (flower: Flower) => {
  flowers.push(flower);
};

// Storage  data

if (!localStorage.getItem("lastID")) {
  localStorage.setItem("lastID", JSON.stringify(0));
}

const getLastID = (): number => {
  let value: string | null = localStorage.getItem("lastID");
  if (!value) {
    throw new Error("lastID not initialized");
  }
  let result: number = JSON.parse(value);
  localStorage.setItem("lastID", JSON.stringify(result + 1));
  return result;
};

type AchievementCount = {
  [tag: string]: number;
};

if (!localStorage.getItem("achievementsCount")) {
  let achievementsCount: AchievementCount = {};
  Object.keys(achievements).map((key: string) => {
    achievementsCount[key] = 0;
  });
  localStorage.setItem("achievementsCount", JSON.stringify(achievementsCount));
}

const getAchievementCount = (tag: string): number => {
  let value: string | null = localStorage.getItem("achievementsCount");
  if (!value) {
    throw new Error("achievementsCount not initialized");
  }
  let achievementsCount: AchievementCount = JSON.parse(value);
  return achievementsCount[tag];
};

const incrementAchievement = (tag: string) => {
  let value: string | null = localStorage.getItem("achievementsCount");
  if (!value) {
    throw new Error("achievementsCount not initialized");
  }
  let achievementsCount: AchievementCount = JSON.parse(value);
  achievementsCount[tag] += 1;
  localStorage.setItem("achievementsCount", JSON.stringify(achievementsCount));
};

/// Database access

const achievementDone = (tag: string): boolean => {
  let objective = 1;
  if (achievements[tag].objective !== undefined) {
    objective = achievements[tag].objective;
  }
  return getAchievementCount(tag) >= objective;
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
  return getFlowers().find((flower) => flower.id == id);
};

const plantsInGreenhouse = (): number => {
  return getFlowers().reduce((count: number, flower: Flower): number => {
    return flower.archived ? count : count + 1;
  }, 0);
};

const maxPlantsInGreenHouse = (): boolean => {
  return plantsInGreenhouse() >= maxNumberOfFlowers;
};

// Actions

const buy = (): void => {
  if (maxPlantsInGreenHouse()) {
    return;
  }
  const flower = new Flower();
  addFlower(flower);
  incrementAchievement("buy");
  if (flower.isMostCommon()) {
    incrementAchievement("simplest");
  }
  for (let i: number = 0; i < numberOfGenes; i++) {
    if (flower.get(i)) {
      if (!dominantCount[i]) {
        incrementAchievement("traits");
        dominantCount[i] = true;
      }
    } else {
      if (!recessiveCount[i]) {
        incrementAchievement("traits");
        recessiveCount[i] = true;
      }
    }
  }
  updateGreenhouse();
  updateEncyclopedia();
  updateAchievements();
};

const displayFamilyTree = (id: number, force: boolean): void => {
  if (familyTreeFlower == id && !force) {
    familyTreeFlower = 0;
  } else {
    familyTreeFlower = id;
    incrementAchievement("tree");
    updateAchievements();
  }
  updateGreenhouse();
  updateFamilyTree();
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

const breed = (): void => {
  if (maxPlantsInGreenHouse()) {
    return;
  }
  const parent1 = flowerForId(selectedFlowers[0]);
  const parent2 = flowerForId(selectedFlowers[1]);
  if (!parent1 || !parent2) {
    return;
  }
  const flower = new Flower(parent1, parent2);
  addFlower(flower);
  incrementAchievement("breed");
  if (flower.isMostCommon()) {
    incrementAchievement("simplest");
  } else if (flower.isRarest()) {
    incrementAchievement("hardest");
  } else if (flower.isAllDominant()) {
    incrementAchievement("dominantPlant");
  } else if (flower.isAllRecessive()) {
    incrementAchievement("recessivePlant");
  }
  for (let i: number = 0; i < numberOfGenes; i++) {
    if (flower.get(i)) {
      if (!dominantCount[i]) {
        incrementAchievement("traits");
        dominantCount[i] = true;
      }
    } else {
      if (!recessiveCount[i]) {
        incrementAchievement("traits");
        recessiveCount[i] = true;
      }
    }
    if (parent1.get(i) == parent2.get(i) && parent1.get(i) != flower.get(i)) {
      // Flower has a trait that neither parents had
      if (flower.get(i)) {
        incrementAchievement("mutation");
      } else {
        incrementAchievement("recessive");
      }
    }
  }
  familyTreeFlower = flower.id;
  displayFamilyTree(flower.id, true);
  // updateFamilyTree();
  // updateGreenhouse();
  // updateAchievements();
  updateEncyclopedia();
};

const star = (id: number): void => {
  let flower = flowerForId(id);
  if (flower === undefined) {
    return;
  }
  flower.starred = !flower.starred;
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
  updateGreenhouse();
  updateAchievements();
};

const archiveDuplicates = (): void => {
  console.log("archiveDuplicates");
  var activeCollection: { [visualID: number]: boolean } = {};
  // Mark starred and selected flowers first (they can't be deleted)
  getFlowers()
    .filter((flower) => {
      return !flower.archived && protectFromArchive(flower);
    })
    .forEach((flower) => {
      const visualID: number = flower.visualID();
      activeCollection[visualID] = true;
    });
  getFlowers().forEach((flower) => {
    if (!flower.archived && !protectFromArchive(flower)) {
      const visualID: number = flower.visualID();
      if (visualID in activeCollection) {
        flower.archived = true;
        incrementAchievement("archive");
      } else {
        activeCollection[visualID] = true;
      }
    }
  });
  updateGreenhouse();
  updateAchievements();
};

// DOM

const flowerHTML = (flower: Flower, archived: boolean): string => {
  console.log(flower);
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

  let output: string = `
    <div class="flower" style="
      --display-stem: ${archived ? `none` : `initial`};
      --display-right-leaf: ${mutated && !archived ? `initial` : `none`};
      --center-color: ${flower.get(1) ? `#ffc75f` : `#b07062`};
      --petal-color1: ${flower.get(0) ? `#845ec2` : `#a00d0d`}; 
      --petal-corner1: ${flower.get(3) ? `20%` : `50%`}; 
      --petal-color2: ${flower.get(4) ? `#b39cd0` : `#ffe5da`};
      --petal-corner2: ${flower.get(5) ? `20%` : `50%`}; 
      --petal-color3: ${flower.get(6) ? `#fbeaff` : `#53b9c7`}; 
      --petal-corner3: ${flower.get(7) ? `30%` : `50%`};"
      ${archived ? `` : `onClick="displayFamilyTree(${flower.id}, false)"`}>
      <div class="stem"></div>
      <div class="leaf left">${nerves}</div>
      <div class="leaf right">${nerves}</div>`;

  let petal1: string = ``;
  let petal2: string = ``;
  let petal3: string = ``;
  let angle: number = 45;
  const step: number = 360 / numberOfPetals;
  for (let index = 0; index < numberOfPetals; index++) {
    petal1 += `<div class="petal1" style="--rotation: ${angle}deg;"></div>`;
    petal2 += `<div class="petal2" style="--rotation: ${angle}deg;"></div>`;
    petal3 += `<div class="petal3" style="--rotation: ${
      angle - step / 2
    }deg;"></div>`;
    angle += step;
  }
  output += petal3;
  output += petal2;
  output += petal1;
  output += `<div class="center"></div>`;
  output += `</div>`;
  return output;
};

const flowerCardHTML = (flower: Flower): string => {
  return `
<div class="card">
  <div class="buttonRow">
    <div class="btn" button type="button" 
    ${
      protectFromArchive(flower)
        ? `disabled`
        : `onClick="archive(${flower.id})"`
    }>${archiveText}</div>
    <div class="btn" onClick="selectForBreeding(${flower.id})">
    ${isSelectedForBreeding(flower.id) ? checkedText : unCheckedText}
    </div>
    <div class="btn" onClick="star(${flower.id})">
    ${flower.starred ? starredText : unStarredText}
    </div>
  </div>
  ${flowerHTML(flower, false)}
</div>`;
};

const appendAchievementCardHTML = (
  container: HTMLElement,
  tag: string
): void => {
  const achievement: Achievement = achievements[tag];
  const count: number = getAchievementCount(tag);

  let output: string = `
<div class="card">
  <span class="card--name">${achievement.description}</span>
  <span class="card--name">${count}${
    achievement.objective === undefined ? "" : "/" + achievement.objective
  }</span>
</div>`;
  container.innerHTML += output;
};

const updateGreenhouse = (): void => {
  const container: HTMLElement | any = document.getElementById("greenhouse");
  // TODO: disable buttons if too many plants
  const maxPlants: boolean = maxPlantsInGreenHouse();
  let result: string = `
<div class="buttonRow">
  <div class="btn" type="button" ${
    maxPlants ? `disabled` : `onClick="buy()"`
  }>Buy</div>
  <div class="btn" onClick="breed()" ${
    maxPlants ? `disabled` : `onClick="buy()"`
  }>Breed</div>
  <div class="btn" onClick="archiveDuplicates()">Archive duplicates</div>
</div>
<div class="grid-container">`;
  getFlowers()
    .filter((flower) => !flower.archived)
    .forEach((flower) => {
      result += flowerCardHTML(flower);
    });
  result += `
</div>`;
  container.innerHTML = result;
};

const updateFamilyTree = (): void => {
  const container: HTMLElement | any = document.getElementById("family-tree");
  container.innerHTML = ``;
  let selectedFlower: Flower | undefined = flowerForId(familyTreeFlower);
  if (selectedFlower === undefined) {
    return;
  }
  container.innerHTML += `<div class=familyTreeRow>`;
  let parent1: Flower | undefined = flowerForId(selectedFlower.parent1);
  if (parent1 !== undefined) {
    container.innerHTML += `${flowerHTML(parent1, false)} -> `;
  }
  container.innerHTML += flowerHTML(selectedFlower, false);
  let parent2: Flower | undefined = flowerForId(selectedFlower.parent2);
  if (parent2 !== undefined) {
    container.innerHTML += ` <- ${flowerHTML(parent2, false)}`;
  }
  container.innerHTML += `</div>`;
};

const updateEncyclopedia = (): void => {
  const container: HTMLElement | any = document.getElementById("encyclopedia");
  let dict: { [visualD: number]: Flower } = {};
  getFlowers().forEach((flower: Flower) => {
    dict[flower.visualID()] = flower;
  });
  let result: string = `<div class="grid-container">`;
  Object.values(dict).forEach((flower: Flower) => {
    result += `${flowerHTML(flower, true)}`;
  });
  result += `</div>`;
  const plantCount: number = Object.keys(dict).length;
  while (getAchievementCount("allPlants") < plantCount) {
    incrementAchievement("allPlants");
  }
  container.innerHTML = result;
};

const updateAchievements = (): void => {
  const container: HTMLElement | any = document.getElementById("achievements");
  container.innerHTML = ``;
  const visibleAchievementTags: string[] = Object.keys(achievements).filter(
    (tag: string) => achievementVisible(tag)
  );
  // Display undone achievements first
  visibleAchievementTags
    .filter((tag: string) => !achievementDone(tag))
    .forEach((tag: string) => {
      appendAchievementCardHTML(container, tag);
    });
  visibleAchievementTags
    .filter((tag: string) => achievementDone(tag))
    .forEach((tag: string) => {
      appendAchievementCardHTML(container, tag);
    });

  /*
  Object.keys(achievements).forEach((mainTag: string) => {
    achievements[mainTag].dependsOn.forEach((tag: string) => {
      console.log(tag + "-->" + mainTag);
    });
  });
  */
};

// Initialize DOM components

updateGreenhouse();
updateFamilyTree();
updateAchievements();
updateEncyclopedia();
