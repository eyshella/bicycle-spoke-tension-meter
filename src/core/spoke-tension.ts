const G = 9.807

export class SpokeTension {
    public static fromFrequency(frequency: number, mass: number, length: number): SpokeTension {
        return new SpokeTension(4*mass*length*frequency**2)
    }

    public static fromNewton(value: number): SpokeTension {
        return new SpokeTension(value)
    }

    public static fromKGS(value: number): SpokeTension {
        return new SpokeTension(value*G)
    }

    public toFrequency(mass: number, length: number): number{
        return 0.5*Math.sqrt(this.value/(mass*length))
    }

    get newton() {
        return this.value
    }

    get kgf() {
        return this.value / G
    }

    private constructor(private value: number) {}
}
