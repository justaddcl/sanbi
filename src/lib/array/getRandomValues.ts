import { generateRandomNumber } from "@lib/numbers";

/** TODO: add unit tests */
export function getRandomValues<ValuesType>(
  values: ValuesType[],
  count: number,
  allowRepeats = false,
): ValuesType[] {
  const randomValues: ValuesType[] = [];
  const valuesCopy = [...values];

  for (let index = 0; index < count; index++) {
    const randomIndex = generateRandomNumber(valuesCopy.length);
    if (allowRepeats) {
      randomValues.push(valuesCopy[randomIndex] as ValuesType);
    } else {
      const [removedValue] = valuesCopy.splice(randomIndex, 1);
      randomValues.push(removedValue as ValuesType);
    }
  }

  return randomValues;
}
