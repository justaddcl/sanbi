import { generateRandomNumber } from "@lib/numbers";

/** TODO: add unit tests */
export function getRandomValues<ValuesType>(
  values: ValuesType[],
  count: number,
): ValuesType[] {
  const randomValues: ValuesType[] = [];
  const valuesCopy = [...values];

  for (let index = 0; index < count; index++) {
    const randomIndex = generateRandomNumber(valuesCopy.length - 1);
    const [removedValue] = valuesCopy.splice(randomIndex, 1);
    randomValues.push(removedValue!);
  }

  return randomValues;
}
