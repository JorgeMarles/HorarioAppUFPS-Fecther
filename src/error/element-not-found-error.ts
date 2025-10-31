class ElementNotFoundError extends Error {
    constructor(message: string){
        super(message);
    }
}

export default ElementNotFoundError