/* eslint-disable no-console,no-restricted-syntax,no-await-in-loop */
import { bundleRunner } from './bundle/bundle-runner';
import { copyExternals } from './copy-external';
import { BROWSERS, ENVS } from './constants';
import { webpackConfig } from './bundle/webpack-config';
import { crx } from './bundle/crx';

const bundleChrome = () => {
    const config = webpackConfig(BROWSERS.CHROME);
    return bundleRunner(config);
};

const bundleFirefoxAmo = () => {
    const config = webpackConfig(BROWSERS.FIREFOX_AMO);
    return bundleRunner(config);
};

const bundleFirefoxStandalone = () => {
    const config = webpackConfig(BROWSERS.FIREFOX_STANDALONE);
    return bundleRunner(config);
};

const bundleEdge = () => {
    const config = webpackConfig(BROWSERS.EDGE);
    return bundleRunner(config);
};

const bundleOpera = () => {
    const config = webpackConfig(BROWSERS.OPERA);
    return bundleRunner(config);
};

const bundleChromeCrx = async () => {
    await crx(BROWSERS.CHROME);
};

const devPlan = [
    copyExternals,
    bundleChrome,
    bundleFirefoxAmo,
    bundleFirefoxStandalone,
    bundleEdge,
    bundleOpera,
];

const betaPlan = [
    copyExternals,
    bundleChrome,
    bundleChromeCrx,
    bundleFirefoxStandalone,
    // TODO prepare firefox xpi
    bundleEdge,
    bundleOpera,
];

const releasePlan = [
    copyExternals,
    bundleChrome,
    bundleFirefoxAmo,
    bundleEdge,
    bundleOpera,
    // TODO prepare opera crx
];

const runBuild = async (tasks) => {
    for (const task of tasks) {
        await task();
    }
};

const main = async () => {
    switch (process.env.BUILD_ENV) {
        case ENVS.DEV: {
            await runBuild(devPlan);
            break;
        }
        case ENVS.BETA: {
            await runBuild(betaPlan);
            break;
        }
        case ENVS.RELEASE: {
            await runBuild(releasePlan);
            break;
        }
        default:
            throw new Error('Provide BUILD_ENV to choose correct build plan');
    }
};

(async () => {
    await main();
})();
