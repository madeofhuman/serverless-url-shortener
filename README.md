# Serverless URL Shortener

A basic URL shortener service built on serverless architecture. Capstone project for the Udacity Cloud Developer Nanodegree course.

## Access

The API can be accessed using the included postman collection. For testing purposes, an authorization header has been included in the postman collection.

## Endpoints

**Base Endpoint:** https://xgc8h3gbw0.execute-api.eu-west-2.amazonaws.com/dev

**Shorten Long URL:** `POST https://xgc8h3gbw0.execute-api.eu-west-2.amazonaws.com/dev/shorten` with body: ```{longUrl: 'https://google.com}```

**Get list of shortened URLs**: `GET https://xgc8h3gbw0.execute-api.eu-west-2.amazonaws.com/dev/shortenedUrls`

**Get single shortened URL:** `GET https://xgc8h3gbw0.execute-api.eu-west-2.amazonaws.com/dev/shortenedUrls/{shortenedUrlId}`

**Delete shortened URL:** `DELETE https://xgc8h3gbw0.execute-api.eu-west-2.amazonaws.com/dev/shortenedUrls/{shortenedUrlId}`

**Redirect from Short URL to Long URL:** `GET {shortUrl}` visit in a web browser

## Manual authorization

For manual authorization, visit the following endpoint and sign in/up with auth0: https://madeofhuman.us.auth0.com/authorize?client_id=NicseYTp1dKOX3MrOutCavJggITPQ4r8&response_type=token%20id_token&redirect_uri=http%3A%2F%2Flocalhost%3A3003%2Fcallback&scope=openid&state=AXcfRkVf8UcoNILGjCvPnd6-.yAwlX8V&nonce=S5.rZPbstiPJG.zLMHrsQsgJKuVkx-xD

Copy the JWT token from the callback url and update the value in the postman collection.

