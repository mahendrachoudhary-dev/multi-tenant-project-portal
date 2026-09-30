import { createContext, useContext } from "react";
import { useResource } from "../hooks/useResource";

export const ScopeContext = createContext(null);
const OrganizationContext = createContext(null);

export function OrganizationProvider({ children }) {
  const resource = useResource("/organizations");
  return (
    <OrganizationContext.Provider
      value={{ ...resource, organizations: resource.data?.organizations || [] }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganizations = () => useContext(OrganizationContext);
export const useScope = () => useContext(ScopeContext);
