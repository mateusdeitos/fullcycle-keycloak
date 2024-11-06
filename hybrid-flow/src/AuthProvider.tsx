import { JWTPayload } from "jose";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import * as utils from "./utils";

type AuthContextProps = {
  auth: JWTPayload | null;
  login: (
    accessToken: string,
    refreshToken: string,
    idToken: string,
    state: string
  ) => void;
  logout: () => void;
};

//create a context for the login state
export const AuthContext = createContext<AuthContextProps | null>(null);

//create a provider for the login state
export const AuthProvider = (props: PropsWithChildren) => {
  const login = useCallback(
    (
      accessToken: string,
      refreshToken: string,
      idToken: string,
      state: string
    ) => {
      const authData = utils.handleLoginCallback(
        accessToken,
        refreshToken,
        idToken,
        state
      );
      setData({
        auth: authData,
      });
      return authData;
    },
    []
  );

  const logout = () => {
    setData({
      auth: null,
    });
  };

  const [data, setData] = useState({
    auth: utils.getAuth(),
  });

  return (
    <AuthContext.Provider
      value={{
        auth: data.auth,
        login,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
