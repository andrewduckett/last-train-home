{
  description = "Node development shell";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      lib = nixpkgs.lib;
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = f: lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});

      # "22", "v22" or "22.1.0" in .nvmrc all select nodejs_22.
      nodeMajor = lib.head (
        lib.splitString "." (lib.removePrefix "v" (lib.trim (builtins.readFile ./.nvmrc)))
      );
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [ pkgs."nodejs_${nodeMajor}" ];
        };
      });
    };
}
