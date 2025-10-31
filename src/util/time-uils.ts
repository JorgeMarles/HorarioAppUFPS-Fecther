
const daysOfWeek: string[] = [
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
    "DOMINGO",
]

/**
 * Gets the index of the day of week by given name
 * @param day the day of the week
 * @returns index [0,6] according to ["LUNES","DOMINGO"]
 */
function getDay(day: string): number {
    if (!(daysOfWeek.includes(day))) {
        throw new Error(`${day} is not a valid day (valid days: ${daysOfWeek.join(",")})`)
    }
    return daysOfWeek.indexOf(day)
}


/**
 * Transforms a time range (e.g. 08:00-09:00) to its indexes
 * 
 * The index of a time is defined by `{@link getIndexOfTime}`
 * @param horasString 
 * @returns array of two numbers, indexes of the two hours
 */
function getRangeAsIndexes(range: string): [number, number] {
    const hours = range.split("-");
    if(hours.length !== 2){
        throw new Error(`Given range ${range}`)
    }
    const allData: number[] = hours.map(e => getIndexOftime(e))
    const [h1, h2] = allData;
    return [h1, h2];
}

/**
 * Given a time (e.g. 08:00) gets its index.
 * 
 * The index is given by this relation:
 * 
 * - 06:00 -> 0
 * - 07:00 -> 1
 * - 23:00 -> 17
 * 
 * @param time the time as string
 * @returns the index
 */
function getIndexOftime(time: string): number {
    const hourStr: string = time.split(":")[0];
    const hourNum: number = parseInt(hourStr);
    if(hourNum < 6 || hourNum > 23){
        throw new Error(`Given time ${time} is outside range ([06:00, 23:00])`)
    }
    return hourNum - 6;
} 

export {getDay, getIndexOftime, getRangeAsIndexes}