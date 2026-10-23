import { serverModules } from "../modules.ts";

/** The shared read face of a module's versioned public document. */
export function readModulePublication<T = unknown>(name: string): T {
  const publication = serverModules().find((module) => module.name === name)?.publication;
  if (!publication) throw new Error(`No public document for module ${name}`);
  return publication.read() as T;
}
