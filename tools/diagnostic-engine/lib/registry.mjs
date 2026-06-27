import { readJson, readRepoFile, repoFileExists, writeJson } from "./paths.mjs";

export function loadWorkflowConfig() {
  return readJson("config/first-practical-application.json");
}

export function loadProjectRegistration() {
  return readJson("projects/aibeopchin-first-project.json");
}

export function loadReferenceDocRegistry() {
  return readJson("reference-docs/aibeopchin-canonical-registry.json");
}

export function loadPlatformExpansionRegistry() {
  return readJson("platform-expansion/registry.json");
}

export function registerProject() {
  const project = loadProjectRegistration();
  const missingCanonical = project.canonicalSources.filter((p) => !repoFileExists(p));
  const missingMvp = project.mvpEntryPaths.filter((p) => !repoFileExists(p));

  const result = {
    stepId: "register-project",
    projectId: project.projectId,
    projectName: project.projectName,
    role: project.role,
    sourceRoot: project.sourceRoot,
    registeredAt: new Date().toISOString(),
    canonicalSources: project.canonicalSources.map((p) => ({
      path: p,
      exists: repoFileExists(p),
    })),
    mvpEntryPaths: project.mvpEntryPaths.map((p) => ({
      path: p,
      exists: repoFileExists(p),
    })),
    ok: missingCanonical.length === 0 && missingMvp.length === 0,
    missing: [...missingCanonical, ...missingMvp],
  };

  writeJson("_runtime/project-registration.json", result);
  return result;
}

export function registerReferenceDocs() {
  const registry = loadReferenceDocRegistry();
  const docs = registry.referenceDocs.map((doc) => {
    const content = readRepoFile(doc.path);
    return {
      ...doc,
      exists: content !== null,
      byteLength: content?.length ?? 0,
    };
  });

  const missing = docs.filter((doc) => !doc.exists).map((doc) => doc.path);
  const result = {
    stepId: "register-reference-docs",
    registryId: registry.registryId,
    projectId: registry.projectId,
    registeredAt: new Date().toISOString(),
    docs,
    ok: missing.length === 0,
    missing,
  };

  writeJson("_runtime/reference-docs-registration.json", result);
  return result;
}

export function registerPlatformExpansion() {
  const registry = loadPlatformExpansionRegistry();
  const platforms = registry.platforms.map((platform) => ({
    ...platform,
    profileExists: repoFileExists(platform.nurionProfilePath),
  }));

  const missingProfiles = platforms
    .filter((p) => !p.profileExists)
    .map((p) => p.nurionProfilePath);

  const result = {
    stepId: "platform-expansion",
    registryId: registry.registryId,
    primaryProjectId: registry.primaryProjectId,
    registeredAt: new Date().toISOString(),
    platforms,
    ok: missingProfiles.length === 0,
    missingProfiles,
  };

  writeJson("_runtime/platform-expansion-registration.json", result);
  return result;
}
