import "reflect-metadata";

export type ReturnType = "Promise" | undefined;

/**
 * An empty decorator to force adding Reflect
 */
export function returnType(
  _target: any,
  _propertyName: string,
  _descriptor: PropertyDescriptor
): void {}

export function getReturnType(
  target: Object,
  propertyName: string
): ReturnType {
  const returnType = Reflect.getMetadata(
    "design:returntype",
    target,
    propertyName
  );
  if (returnType && returnType.name === "Promise") {
    return "Promise";
  }
  return undefined;
}
