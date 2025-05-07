if (!process.env.BASE_URL) {
  require('dotenv').config({ path: '.env.development' })
}
module.exports = {
  expo: {
    name: "PioneerMart",
    slug: "frontend",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/PioneerMartLogo-01.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/PioneerMartLogo-01.png",
      resizeMode: "contain",
      backgroundColor: "#FFF9F0",
    },
    ios: {
      bundleIdentifier: "com.khalidmu.pioneermart",
      supportsTablet: false,
      buildNumber: "1.0.9",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSAppTransportSecurity: {
          NSExceptionDomains: {
            "env-2325023.us.reclaim.cloud": {
              NSIncludesSubdomains: true,
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSTemporaryExceptionMinimumTLSVersion: "TLSv1.2"
            }
          }
        }
      }
    },
    android: {
      package: "com.khalidmu.pioneermart",
      versionCode: 2,
      adaptiveIcon: {
        foregroundImage: "./assets/images/PioneerMartLogo-01.png",
        backgroundColor: "#FFF9F0",
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
    ],    
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      apiUrl: process.env.BASE_URL,
      SE_API_USER: process.env.SE_API_USER,
      SE_SECRET_KEY: process.env.SE_SECRET_KEY,
      SE_WORKFLOW: process.env.SE_WORKFLOW,
      eas: {
        projectId: "c0f86cce-05c6-48b1-8fcf-f44bd512d154"
      },
    }
  }
}
