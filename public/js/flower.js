"use strict";
// Constants
const numberOfGenes = 8;
// Random
const Try = (chances) => {
    return Math.random() <= chances;
};
const InheritA = () => {
    return 0.5;
};
const Mutate = () => {
    return 0.2;
};
const Dominant = (i) => {
    return i / (numberOfGenes - 1);
};
const RecessiveIsRarer = (i) => {
    return Math.pow((1 - Dominant(i)), 2) < 0.5;
};
class ChromosomeSet {
    constructor() {
        this.value = new Array(numberOfGenes);
        this.hasMutated = false;
    }
    static Buy() {
        const c = new ChromosomeSet();
        for (let i = 0; i < numberOfGenes; i++) {
            c.value[i] = Try(Dominant(i));
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
        g.set1 = ChromosomeSet.Buy();
        g.set2 = ChromosomeSet.Buy();
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
        for (let i = 0; i < numberOfGenes; i++) {
            result *= 2;
            result += this.get(i) ? 1 : 0;
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
        console.log(data);
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
    hasVisibleMutation() {
        return false;
    }
    hasVisibleRecessive() {
        return false;
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
}
