const dotenv = require('dotenv')
if (process.env.EAS_BUILD_PROFILE === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.development' });
}
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8000';
const SE_API_USER = process.env.SE_API_USER
const SE_SECRET_KEY = process.env.SE_SECRET_KEY
const SE_WORKFLOW = process.env.SE_WORKFLOW
const DEBUG = process.env.DEBUG === 'true';
module.exports = {
  expo: {
    name: "frontend",
    slug: "frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.khalidmu.pioneermart",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
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
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "c0f86cce-05c6-48b1-8fcf-f44bd512d154"
      },
      apiUrl: BASE_URL,
      SE_API_USER: SE_API_USER,
      SE_SECRET_KEY: SE_SECRET_KEY,
      SE_WORKFLOW: SE_WORKFLOW,
      debug: DEBUG,
    }
  }
}
