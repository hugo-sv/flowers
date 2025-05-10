"use strict";
// Constants
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const numberOfGenes = 8;
const maxNumberOfFlowers = 30;
const archiveText = "x";
const starredText = "★";
const unStarredText = "☆";
const checkedText = "☑";
const unCheckedText = "☐";
const achievements = {
    buy: {
        dependsOn: [],
        description: "<b>Buy flowers.</b> Not all flowers can be found on the market.",
    },
    breed: {
        dependsOn: ["buy"],
        description: "<b>Select two flowers and breed them.</b> Up to 30 flowers can be stored.",
    },
    archive: {
        dependsOn: ["buy"],
        description: "<b>Archive flowers.</b> They can't be used for further breeding.",
    },
    tree: {
        dependsOn: ["breed"],
        description: "<b>Open a family tree</b> by clicking on a flower.",
    },
    mutationLeaf: {
        dependsOn: ["tree"],
        description: "<b>Observe bigger leaves</b>, indicating a mutation has occurred.",
    },
    mutation: {
        dependsOn: ["mutationLeaf"],
        description: "Observe a trait that can only be caused by a <b>mutation</b>.",
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
        objective: Math.pow(2, numberOfGenes),
    },
};
// Random
const Try = (chances) => {
    return Math.random() <= chances;
};
const InheritA = () => {
    return 0.5;
};
const Mutate = () => {
    return 0.007;
};
const Dominant = (i, isSecondSet) => {
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
const RecessiveIsRarer = (i) => {
    return (1 - Dominant(i, false)) * (1 - Dominant(i, true)) < 0.5;
};
class ChromosomeSet {
    constructor() {
        this.value = new Array(numberOfGenes);
        this.hasMutated = false;
    }
    static Buy(isSecondSet) {
        const c = new ChromosomeSet();
        for (let i = 0; i < numberOfGenes; i++) {
            c.value[i] = Try(Dominant(i, isSecondSet));
        }
        return c;
    }
    static Breed(A, B) {
        const c = new ChromosomeSet();
        for (let i = 0; i < numberOfGenes; i++) {
            c.value[i] = (Try(InheritA()) ? A : B).get(i);
            if (A.get(i) == B.get(i) && Try(Mutate())) {
                c.value[i] = !c.value[i];
                c.hasMutated = true;
            }
        }
        return c;
    }
    static FromJson(data) {
        const c = new ChromosomeSet();
        c.value = data.value;
        c.hasMutated = data.hasMutated;
        return c;
    }
    get(i) {
        return this.value[i];
    }
}
class Genome {
    constructor() {
        this.set1 = new ChromosomeSet();
        this.set2 = new ChromosomeSet();
    }
    static Buy() {
        const g = new Genome();
        g.set1 = ChromosomeSet.Buy(false);
        g.set2 = ChromosomeSet.Buy(true);
        return g;
    }
    static Breed(A, B) {
        const g = new Genome();
        g.set1 = ChromosomeSet.Breed(A.set1, A.set2);
        g.set2 = ChromosomeSet.Breed(B.set1, B.set2);
        return g;
    }
    static FromJson(data) {
        const g = new Genome();
        g.set1 = ChromosomeSet.FromJson(data.set1);
        g.set2 = ChromosomeSet.FromJson(data.set2);
        return g;
    }
    hasMutated() {
        return this.set1.hasMutated || this.set2.hasMutated;
    }
    visualID() {
        let result = 0;
        for (let i = numberOfGenes - 1; i >= 0; i--) {
            result *= 2;
            result += this.get(i) ? 0 : 1;
        }
        return result;
    }
    get(i) {
        return this.set1.value[i] || this.set2.value[i];
    }
    isRarest() {
        for (let i = 0; i < numberOfGenes; i++) {
            if (this.get(i) == RecessiveIsRarer(i)) {
                return false;
            }
        }
        return true;
    }
    isMostCommon() {
        for (let i = 0; i < numberOfGenes; i++) {
            if (this.get(i) != RecessiveIsRarer(i)) {
                return false;
            }
        }
        return true;
    }
    isAllRecessive() {
        for (let i = 0; i < numberOfGenes; i++) {
            if (this.get(i)) {
                return false;
            }
        }
        return true;
    }
    isAllDominant() {
        for (let i = 0; i < numberOfGenes; i++) {
            if (!this.get(i)) {
                return false;
            }
        }
        return true;
    }
}
class Flower {
    constructor() {
        this.id = 0;
        this.parent1 = 0;
        this.parent2 = 0;
        this.genome = new Genome();
        this.archived = false;
        this.starred = false;
    }
    static Buy() {
        const f = new Flower();
        f.id = incrementLastID();
        f.genome = Genome.Buy();
        return f;
    }
    static Breed(A, B) {
        const f = new Flower();
        f.id = incrementLastID();
        f.parent1 = A.id;
        f.parent2 = B.id;
        f.genome = Genome.Breed(A.genome, B.genome);
        return f;
    }
    static FromJson(data) {
        const f = new Flower();
        f.id = data.id;
        f.parent1 = data.parent1;
        f.parent2 = data.parent2;
        f.genome = Genome.FromJson(data.genome);
        f.archived = data.archived;
        f.starred = data.starred;
        return f;
    }
    hasMutated() {
        return this.genome.hasMutated();
    }
    visualID() {
        return this.genome.visualID();
    }
    static MaxVisualID() {
        return Math.pow(2, numberOfGenes);
    }
    get(i) {
        return this.genome.get(i);
    }
    isRarest() {
        return this.genome.isRarest();
    }
    isMostCommon() {
        return this.genome.isMostCommon();
    }
    isAllRecessive() {
        return this.genome.isAllRecessive();
    }
    isAllDominant() {
        return this.genome.isAllDominant();
    }
    log() {
        console.log(JSON.stringify(this));
    }
}
// Non-saved data
let familyTreeFlower = 0;
let selectedFlowers = [0, 0];
let displayUnknownFLowers = false;
// Storage data
/// Flowers
let flowers = [];
{
    const value = localStorage.getItem("flowers");
    if (!value) {
        localStorage.setItem("flowers", JSON.stringify(flowers));
    }
    else {
        flowers = JSON.parse(value).map((data) => Flower.FromJson(data));
    }
}
const updateFlowers = () => __awaiter(void 0, void 0, void 0, function* () {
    localStorage.setItem("flowers", JSON.stringify(flowers));
});
const addFlower = (flower) => {
    flowers.push(flower);
    updateFlowers();
};
/// LastID
let lastID = 0;
{
    const value = localStorage.getItem("lastID");
    if (!value) {
        localStorage.setItem("lastID", JSON.stringify(lastID));
    }
    else {
        lastID = JSON.parse(value);
    }
}
const updateLastID = () => __awaiter(void 0, void 0, void 0, function* () {
    localStorage.setItem("lastID", JSON.stringify(lastID));
});
const incrementLastID = () => {
    lastID += 1;
    updateLastID();
    return lastID;
};
let achievementsCount = {};
{
    const value = localStorage.getItem("achievementsCount");
    if (!value) {
        Object.keys(achievements).map((key) => {
            achievementsCount[key] = 0;
        });
        localStorage.setItem("achievementsCount", JSON.stringify(achievementsCount));
    }
    else {
        achievementsCount = JSON.parse(value);
    }
}
const updateAchievementsCount = () => __awaiter(void 0, void 0, void 0, function* () {
    localStorage.setItem("achievementsCount", JSON.stringify(achievementsCount));
});
const incrementAchievement = (tag) => {
    achievementsCount[tag] += 1;
    updateAchievementsCount();
};
let achievementsExample = {};
{
    const value = localStorage.getItem("achievementsExample");
    if (!value) {
        Object.keys(achievements).map((key) => {
            achievementsExample[key] = 0;
        });
        localStorage.setItem("achievementsExample", JSON.stringify(achievementsExample));
    }
    else {
        achievementsExample = JSON.parse(value);
    }
}
const updateAchievementsExample = () => __awaiter(void 0, void 0, void 0, function* () {
    localStorage.setItem("achievementsExample", JSON.stringify(achievementsExample));
});
const setAchievementExample = (tag, flowerId) => {
    achievementsExample[tag] = flowerId;
    updateAchievementsExample();
};
// Trait count
let recessiveCount = [];
{
    const value = localStorage.getItem("recessiveCount");
    if (!value) {
        for (let i = 0; i < numberOfGenes; i++) {
            recessiveCount.push(false);
        }
        localStorage.setItem("recessiveCount", JSON.stringify(recessiveCount));
    }
    else {
        recessiveCount = JSON.parse(value);
    }
}
let dominantCount = [];
{
    const value = localStorage.getItem("dominantCount");
    if (!value) {
        for (let i = 0; i < numberOfGenes; i++) {
            dominantCount.push(false);
        }
        localStorage.setItem("dominantCount", JSON.stringify(dominantCount));
    }
    else {
        dominantCount = JSON.parse(value);
    }
}
const updateTraitCount = () => __awaiter(void 0, void 0, void 0, function* () {
    localStorage.setItem("recessiveCount", JSON.stringify(recessiveCount));
    localStorage.setItem("dominantCount", JSON.stringify(dominantCount));
});
/// Database access
const achievementDone = (tag) => {
    let objective = 1;
    if (achievements[tag].objective !== undefined) {
        objective = achievements[tag].objective;
    }
    return achievementsCount[tag] >= objective;
};
const achievementCompletion = (tag) => {
    return (achievementsCount[tag] /
        (achievements[tag].objective ? achievements[tag].objective : 1));
};
const achievementVisible = (tag) => {
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
const parentsCanBreed = () => {
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
const isSelectedForBreeding = (id) => {
    return id == selectedFlowers[0] || id == selectedFlowers[1];
};
const flowerForId = (id) => {
    return flowers.find((flower) => flower.id == id);
};
const plantsInGreenhouse = () => {
    return flowers.reduce((count, flower) => {
        return flower.archived ? count : count + 1;
    }, 0);
};
const maxPlantsInGreenHouse = () => {
    return plantsInGreenhouse() >= maxNumberOfFlowers;
};
// Actions
const switchEncyclopediaDisplay = () => {
    displayUnknownFLowers = !displayUnknownFLowers;
    updateEncyclopedia();
};
const buy = () => {
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
    for (let i = 0; i < numberOfGenes; i++) {
        if (flower.get(i)) {
            if (!dominantCount[i]) {
                incrementAchievement("traits");
                dominantCount[i] = true;
                updateTraitCount();
            }
        }
        else {
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
const displayTreeForAchievement = (tag) => {
    if (familyTreeFlower != achievementsExample[tag]) {
        familyTreeFlower = achievementsExample[tag];
        updateFamilyTree();
    }
};
const displayFamilyTree = (id) => {
    incrementAchievement("tree");
    updateAchievements();
    if (familyTreeFlower != id) {
        familyTreeFlower = id;
        updateGreenhouse();
        updateFamilyTree();
    }
};
const selectForBreeding = (id) => {
    if (selectedFlowers[1] == id) {
        selectedFlowers[1] = selectedFlowers[0];
        selectedFlowers[0] = 0;
    }
    else if (selectedFlowers[0] == id) {
        selectedFlowers[0] = 0;
    }
    else {
        selectedFlowers[0] = selectedFlowers[1];
        selectedFlowers[1] = id;
    }
    updateGreenhouse();
};
const canBreed = () => {
    return (!maxPlantsInGreenHouse() &&
        flowerForId(selectedFlowers[0]) !== undefined &&
        flowerForId(selectedFlowers[1]) !== undefined);
};
const breed = () => {
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
    }
    else if (flower.isRarest()) {
        incrementAchievement("hardest");
        setAchievementExample("hardest", flower.id);
    }
    else if (flower.isAllDominant()) {
        incrementAchievement("dominantPlant");
        setAchievementExample("dominantPlant", flower.id);
    }
    else if (flower.isAllRecessive()) {
        incrementAchievement("recessivePlant");
        setAchievementExample("recessivePlant", flower.id);
    }
    if (flower.hasMutated()) {
        incrementAchievement("mutationLeaf");
        setAchievementExample("mutationLeaf", flower.id);
    }
    for (let i = 0; i < numberOfGenes; i++) {
        if (flower.get(i)) {
            if (!dominantCount[i]) {
                incrementAchievement("traits");
                dominantCount[i] = true;
                updateTraitCount();
            }
        }
        else {
            if (!recessiveCount[i]) {
                incrementAchievement("traits");
                recessiveCount[i] = true;
                updateTraitCount();
            }
        }
        if (parent1.get(i) == parent2.get(i) && parent1.get(i) != flower.get(i)) {
            // Flower has a trait that neither parents had
            if (flower.get(i)) {
                incrementAchievement("mutation");
                setAchievementExample("mutation", flower.id);
            }
            else {
                incrementAchievement("recessive");
                setAchievementExample("recessive", flower.id);
            }
        }
    }
    familyTreeFlower = flower.id;
    updateFamilyTree();
    updateGreenhouse();
    // updateAchievements();
    updateEncyclopedia();
};
const star = (id) => {
    let flower = flowerForId(id);
    if (flower === undefined) {
        return;
    }
    flower.starred = !flower.starred;
    updateFlowers();
    updateGreenhouse();
};
const protectFromArchive = (flower) => {
    return (flower.starred ||
        isSelectedForBreeding(flower.id) ||
        flower.id == familyTreeFlower);
};
const archive = (id) => {
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
const archiveDuplicates = () => {
    var activeCollection = {};
    // Mark starred and selected flowers first (they can't be deleted)
    flowers
        .filter((flower) => {
        return !flower.archived && protectFromArchive(flower);
    })
        .forEach((flower) => {
        const visualID = flower.visualID();
        activeCollection[visualID] = true;
    });
    flowers.forEach((flower) => {
        if (!flower.archived && !protectFromArchive(flower)) {
            const visualID = flower.visualID();
            if (visualID in activeCollection) {
                flower.archived = true;
                incrementAchievement("archive");
            }
            else {
                activeCollection[visualID] = true;
            }
        }
    });
    updateFlowers();
    updateGreenhouse();
    updateAchievements();
};
// DOM
const emptyFlowerHTML = () => {
    return `<div class="flower" style="--skyColor: lightgrey;"></div>`;
};
const flowerHTML = (flower, archived) => {
    const mutated = flower.hasMutated();
    const numberOfPetals = flower.get(2) ? 6 : 5;
    const nerves = `
    <div class="nerve secondary right" style="--position: -10%"></div>
    <div class="nerve secondary right" style="--position: -35%"></div>
    <div class="nerve secondary right" style="--position: -60%"></div>
    <div class="nerve secondary right" style="--position: -85%"></div>
    <div class="nerve secondary left" style="--position: -5%"></div>
    <div class="nerve secondary left" style="--position: -30%"></div>
    <div class="nerve secondary left" style="--position: -55%"></div>
    <div class="nerve secondary left" style="--position: -80%"></div>
    <div class="nerve main"></div>`;
    const displayStem = archived ? `none` : `initial`;
    const displayRightLeaf = archived || !mutated ? `none` : `initial`;
    // Traits
    const centerColor = flower.get(5) ? `#ab5302` : `#ffc75f`;
    const petalColor1 = flower.get(0) ? `#845ec2` : `#6A2C70`;
    const petalColor2 = flower.get(6) ? `#B83B5E` : `#b39cd0`;
    const petalColor3 = flower.get(1) ? `#fbeaff` : `#F08A5D`;
    const skyColor = flower.get(7) ? `skyblue` : `#061558`;
    const globalFilter = flower.get(7)
        ? `none`
        : `drop-shadow(0px 0px 20px)`;
    const doubledPetals = !flower.get(2);
    const otherBorder = flower.get(4);
    const otherShape = !flower.get(3);
    const petalBorder1 = otherBorder
        ? `50% 50% 50% 50%`
        : `50% 50% 50% 20%`;
    const petalBorder2 = otherBorder
        ? `50% 50% 50% 50%`
        : `50% 50% 50% 20%`;
    const petalBorder3 = otherBorder
        ? `50% 50% 50% 50%`
        : `50% 50% 30% 30%`;
    const centerSize = otherShape ? `16%` : `12%`;
    const petalWidth1 = otherShape ? `10%` : `8%`;
    const petalHeight1 = otherShape ? `25%` : `18%`;
    const petalWidth2 = otherShape ? `23%` : `18%`;
    const petalHeight2 = otherShape ? `35%` : `38%`;
    const petalWidth3 = otherShape ? `23%` : `28%`;
    const petalHeight3 = otherShape ? `45%` : `42%`;
    let output = `
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
    let petal1 = ``;
    let petal1bis = ``;
    let petal2 = ``;
    let petal2bis = ``;
    let petal3 = ``;
    let petal3bis = ``;
    let angle = 45;
    const step = 360 / numberOfPetals;
    for (let index = 0; index < numberOfPetals; index++) {
        const otherAngle = angle - step / 2;
        petal1 += `<div class="petal style1" style="--rotation: ${otherShape ? angle : otherAngle}deg;"></div>`;
        petal2 += `<div class="petal style2" style="--rotation: ${otherShape ? angle : otherAngle}deg;"></div>`;
        petal3 += `<div class="petal style3" style="--rotation: ${otherAngle}deg;"></div>`;
        if (doubledPetals) {
            petal1bis += `<div class="petal style1" style="--rotation: ${otherShape ? otherAngle : angle}deg;"></div>`;
            petal2bis += `<div class="petal style2" style="--rotation: ${otherShape ? otherAngle : angle}deg;"></div>`;
            petal3bis += `<div class="petal style3" style="--rotation: ${angle}deg;"></div>`;
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
const flowerCardHTML = (flower) => {
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
    ${protectFromArchive(flower)
        ? `disabled`
        : `onClick="archive(${flower.id})"`}>${archiveText}</button>
  </div>
  ${flowerHTML(flower, false)}
</div>`;
};
const appendAchievementCardHTML = (container, tag) => {
    const achievement = achievements[tag];
    const count = achievementsCount[tag];
    const completion = Math.min(Math.max(achievementCompletion(tag), 0), 1) * 100;
    const achievementCanBeClicked = achievementsExample[tag] != 0;
    const hasObjective = achievement.objective !== undefined;
    let output = `
  <div class="achievement${achievementCanBeClicked ? " achievementHoverable" : ""}" 
       style="--percent: ${completion}%;"
       ${achievementCanBeClicked
        ? `onClick=displayTreeForAchievement('${tag}')`
        : ``}
       >
    <span>${achievement.description}</span>
    <span>${count}${hasObjective ? "/" + achievement.objective : ""}</span>
  </div>`;
    container.innerHTML += output;
};
const updateGreenhouse = () => __awaiter(void 0, void 0, void 0, function* () {
    const container = document.getElementById("greenhouse");
    // TODO: disable buttons if too many plants
    const maxPlants = maxPlantsInGreenHouse();
    const cantBreed = maxPlants || !canBreed();
    let result = `
<div class="buttonRow greenhouseButtonRow">
  <button class="btn" type="button" ${maxPlants ? `disabled` : `onClick="buy()"`}>Buy</button>
  <button class="btn" type="button" ${cantBreed ? `disabled` : `onClick="breed()"`}>Breed</button>
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
});
const updateFamilyTree = () => __awaiter(void 0, void 0, void 0, function* () {
    const container = document.getElementById("family-tree");
    container.innerHTML = ``;
    let child = flowerForId(familyTreeFlower);
    if (child === undefined) {
        return;
    }
    let parent1 = flowerForId(child.parent1);
    let parent11 = parent1 === undefined ? undefined : flowerForId(parent1.parent1);
    let parent12 = parent1 === undefined ? undefined : flowerForId(parent1.parent2);
    let parent2 = flowerForId(child.parent2);
    let parent21 = parent2 === undefined ? undefined : flowerForId(parent2.parent1);
    let parent22 = parent2 === undefined ? undefined : flowerForId(parent2.parent2);
    let result = `
<div class="familyTreeRow">
  <div class="parent11">${parent11 === undefined ? emptyFlowerHTML() : flowerHTML(parent11, false)}</div>
  <div class="parent12">${parent12 === undefined ? emptyFlowerHTML() : flowerHTML(parent12, false)}</div>
  <div class="parent21">${parent21 === undefined ? emptyFlowerHTML() : flowerHTML(parent21, false)}</div>
  <div class="parent22">${parent22 === undefined ? emptyFlowerHTML() : flowerHTML(parent22, false)}</div>
  <div class="parent1">${parent1 === undefined ? emptyFlowerHTML() : flowerHTML(parent1, false)}</div>
  <div class="parent2">${parent2 === undefined ? emptyFlowerHTML() : flowerHTML(parent2, false)}</div>
  <div class="child">${child === undefined ? emptyFlowerHTML() : flowerHTML(child, false)}</div>
</div>`;
    container.innerHTML = result;
});
const updateEncyclopedia = () => __awaiter(void 0, void 0, void 0, function* () {
    const container = document.getElementById("encyclopedia");
    let dict = {};
    // Set flowers backward so the first specimen found is displayed in family tree
    for (let index = flowers.length - 1; index >= 0; index--) {
        const flower = flowers[index];
        dict[flower.visualID()] = flower;
    }
    achievementsCount["allPlants"] = Object.keys(dict).length;
    let result = ``;
    if (achievementsCount["allPlants"] >= 32) {
        result += `
    <div class="buttonRow greenhouseButtonRow">
    <div></div>
    <button class="btn" type="button" onClick="switchEncyclopediaDisplay()">${displayUnknownFLowers ? "Hide" : "Show"} all flowers</button>
    </div>`;
    }
    result += `<div class="grid-container-4">`;
    for (let index = 0; index < Flower.MaxVisualID(); index++) {
        if (index in dict) {
            result += `<div>${flowerHTML(dict[index], true)}</div>`;
        }
        else if (displayUnknownFLowers) {
            result += `<div>${emptyFlowerHTML()}</div>`;
        }
    }
    result += `</div>`;
    updateAchievementsCount();
    updateAchievements();
    container.innerHTML = result;
});
const updateAchievements = () => __awaiter(void 0, void 0, void 0, function* () {
    const container = document.getElementById("achievements");
    container.innerHTML = ``;
    const visibleAchievementTags = Object.keys(achievements).filter((tag) => achievementVisible(tag));
    // Sort achievements by completion
    visibleAchievementTags.sort((a, b) => achievementCompletion(a) - achievementCompletion(b));
    visibleAchievementTags.forEach((tag) => {
        appendAchievementCardHTML(container, tag);
    });
});
// Initialize DOM components
updateGreenhouse();
updateFamilyTree();
// updateAchievements();
updateEncyclopedia();
