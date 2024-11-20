/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-require-imports */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import path from "path";
import { fileURLToPath } from "url";

/** @typedef {Parameters<import('next').NextConfig['webpack']>[1]} WebpackConfigContext */
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const injectionSource = path.join(__dirname, "injection.ts");

/**
 * @param {import('webpack').Configuration} config
 * @param {WebpackConfigContext} context
 */
const injectWhyDidYouRender = (config, context) => {
  if (context.dev && !context.isServer) {
    const originalEntry = config.entry;

    config.entry = async () => {
      const entries = await originalEntry();

      if (
        entries["main-app"] &&
        !entries["main-app"].includes(injectionSource)
      ) {
        entries["main-app"].unshift(injectionSource);
      }

      return entries;
    };
  }
};

export default injectWhyDidYouRender;
