<p align="center">
  <img src="https://user-images.githubusercontent.com/22073531/197780929-2d55a09f-d5e6-4e26-b531-1cde9977179a.png" height="250px" style="margin:auto;"/>
</p>

# Songsrated

Welcome to the Songsrated repo. This is an open source web app made to discover what is the best song ever made.

## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Project Status: Active.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
![Stars](https://img.shields.io/github/stars/micheldore/songsrated?label=%E2%AD%90%20Stars)
![Forks](https://img.shields.io/github/forks/micheldore/songsrated?color=%23ff69b4)
![Contributors](https://img.shields.io/github/contributors/micheldore/songsrated?color=blue)
![Follow](https://img.shields.io/github/followers/micheldore?label=Please%20follow%20%20to%20support%20my%20work%20%F0%9F%99%8F&style=social)

## Run Locally

Clone the project

```bash
  git clone https://github.com/micheldore/songsrated.git
```

Go to the project directory

```bash
  cd songsrated
```

Install dependencies

```bash
  yarn install
```

Start the server

```bash
  yarn dev
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`NEXT_PUBLIC_CLIENT_ID` - The Spotify Client ID from your project in your developer account

`NEXT_PUBLIC_CLIENT_SECRET` - The Spotify Client Secret from your project in your developer account

`NEXTAUTH_URL` - The callback url for the NextAuth package. Set to http://localhost:3000/api/auth/, or your domain if running on a server

`JWT_SECRET` - The JWT token secret

`NEXTAUTH_SECRET` - A secret for NextAuth, see their documentation

`DATABASE_HOST` - The database hostname

`DATABASE_USER` - The database username

`DATABASE_PASSWORD` - The database password

`DATABASE_NAME` - The database name

`DATABASE_URL` - The full mysql connection url

## Contributing

Contributions are always welcome!

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.

## Authors

-   [@micheldore](https://www.github.com/micheldore)

## License

[MIT](https://choosealicense.com/licenses/mit/)
