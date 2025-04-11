# Pioneer Mart

Group: 
Seunghyeon (Hyeon) Kim [seunghk1206](https://github.com/seunghk1206), 
Joyce Gill [joycegill](https://github.com/joycegill), 
Lydia Ye [Lydia-Ye](https://github.com/Lydia-Ye), 
Muhammad Khalid [muhammadkhalid-03](https://github.com/muhammadkhalid-03), 
Alan Zhang [yiyZh](https://github.com/yiyZh)

## Project Description

We plan to build a mobile application that provides a campus-based online platform for buying and selling second-hand products, as well as requesting and providing services, within the Grinnell community. With this app, Grinnellians will be able to easily exchange second-hand products and services, such as textbooks, dorm supplies, transportation, and haircuts. The target users of the app will be the Grinnell College community. 

Notable competitors include Etsy, Facebook Marketplace, and Poshmark. Etsy is an online marketplace that allows users to buy and sell handmade items with an emphasis on arts & crafts. Poshmark is also an online marketplace that allows users to buy and sell clothing, home goods, beauty products and more. While platforms like Etsy and Poshmark serve as notable competitors, our app differentiates itself by being exclusively accessible to individuals with a Grinnell College email address. This ensures a secure, college-focused marketplace tailored specifically to the needs of Grinnellians. The common user will be Grinnell College students, faculty, and staff. 

## Repository Layout
- .github/workflows
    - test_runs.yml
    - tests_npm.yml
    - tests_python.yml
- reports
    - milestone-2-report.md
- sprint_reports
    - sprint_01_outcomes.md
    - sprint_01_planning.md
    - sprint_02_planning.md
    - sprint_02.md
    - sprint_03_planning.md
    - sprint_03.md
- src
    - basic_classes
    - frontend
- tests
- README.md

## Sprint Reports

The sprint reports can be found in the "sprint_reports" folder along with the milestone reports.

Sprint 01 planning (named sprint_01_planning.md) can be found in the link in markdown file in the sprint_reports folder.

Sprint 01 outcomes (named sprint_01_outcomes.md) can be found in the link in the markdown file in the sprint_reports folder.

Sprint 02 planning (named sprint_02_planning.md) can be found in the link in markdown file in the sprint_reports folder.

Sprint 02 outcomes (named sprint_02.md) can be found in the link in markdown file in the sprint_reports folder.

Sprint 03 planning (named sprint_03_planning.md) can be found in the link in markdown file in the sprint_reports folder.

Sprint 03 outcomes (named sprint_03.md) can be found in the link in markdown file in the sprint_reports folder.

## Testing

We are using pytest, flake8, and mypy in order to test our back-end code. For the front end, we are using Jest, React Testing Library, and human-driven testing. The git actions are set up in the repository.

### How to run the tests?
Backend (Non-Django related)
> pip install tox tox-gh-actions
> tox

Backend (Django related)
Pre-requisite: be in the src/backend folder
> python3 manage.py test

Frontend
> npm install
> export PATH="./node_modules/.bin:$PATH" 
> yarn jest

## Running the Application

Pre-requisites: 
- XCode must be installed on Macbooks for simulations. Otherwise, Expo Go must be installed on either an iOS or Android.
- The root directory must be within src, and depending on backend or frontend (there must also be 2 separate terminals to run the application)
- npm must be installed. For more details about installing NPM, please refer to this [link](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Running the Backend (server)
> pip install -r requirements.txt
> python3 manage.py

Running the Frontend (npm)
> npm install
> npx expo start

* Please note that npm install may leave out some installations out, so it is highly recommended to install extra dependencies via following
> npm install [name of extra package]

## Operational Use Cases

Use Case 1, 3 are very doable right now with the current prototype that we have. For the other user cases, we have the backend framework constructed, but requires bridging with the frontend in order to actually be used. Some alternative flows such as contacting the other user or selecting the categories are some of the specific features that we are working on.

## Issue Managements

All the issues will be managed in Trello.com. [Link to Trello Board](https://trello.com/b/HqVxVWt0/pioneer-mart)

## Bibliography

1. Etsy. 2025. Etsy: Shop for Handmade, Vintage, Custom, and Unique Gifts. Retrieved February 13, 2025,  
from https://www.etsy.com 

2. Facebook Marketplace. 2025. Buy and Sell Items Locally or Shipped. Retrieved February 13, 2025,  
from https://www.facebook.com/marketplace 

3. Poshmark. 2025. Poshmark: Buy & Sell Fashion. Retrieved February 13, 2025,  
from https://www.poshmark.com

4. Trello. 2025. Pioneer Mart Project Board. Retrieved February 13, 2025,  
from https://trello.com/b/HqVxVWt0/pioneer-mart

5. mCoding. 2025. Automated Testing in Python with pytest, tox, and GitHub Actions. Retrieved March 26, 2025, 
from https://www.youtube.com/watch?v=DhUpxWjOhME

6. Andy's Tech Tutorials. 2025. GitHub Actions Tutorial | Run Automated Tests. Retrieved March 27, 2025, 
from https://www.youtube.com/watch?v=uFcXrWT4f80

7. Test Item image used in DEMO1. "Generate Studio Ghibili style image with this, ensure all bits remain as is" prompt. DALL·E 3, GPT-4o, OpenAI, 2 April 2025. https://drive.google.com/file/d/1YvxUX4z8xLfF9RNFW1dwGyyMnKmlH--g/view?usp=sharing  

8. Source image for Test Item. Photomatic. Retrieved 14 August, 2024.
https://drive.google.com/file/d/1AyQBq8Fw2hZqz5hLmVM9M0U-o-EBiySj/view?usp=sharing

9. Freecodecamp.org. (2023, February 1). Learn Django by Building an Online Marketplace – Python Tutorial for Beginners [Video]. YouTube.com. https://www.youtube.com/watch?v=ZxMB6Njs3ck&t=1411s

10. Pradip Debnath. (2024, October 16). 🔴#1 - eCommerce App in React Native | Home, Login, SignUp, Onboarding UI of eCommerce App [Video]. YouTube.com. https://www.youtube.com/watch?v=y4vNZQpJrdc&t=4729s

![Tests](https://github.com/kimseung-gc/Pioneer_Mart/actions/workflows/test_runs.yml/badge.svg)
![Tests](https://github.com/kimseung-gc/Pioneer_Mart/actions/workflows/tests_npm.yml/badge.svg)
![Tests](https://github.com/kimseung-gc/Pioneer_Mart/actions/workflows/tests_python.yml/badge.svg)
