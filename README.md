
# Alameda Comedy

## Summary

Alameda Comedy is a fullstack CRUD app that provides users with the opportunity to create and maintain lists of comedy shows and comedian records- specifically noting show details, comedic style, and pertinent comedian information. 

## Motivation

Alameda Comedy focuses on the administrative side of entertainment venues. It is designed to be a bank of information for the individuals who are responsible for assembling entertainers in the comedy industry. It provides a clear look at show details, and compiles all relevant comic information in one place.

## Languages/Frameworks Utilized

* [React](https://reactjs.org/)
* [Javascript](https://www.javascript.com/)
* [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference)
* [Node](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [PostgreSQL](https://www.postgresql.org/)

## API Documentation

# Show List
Returns list of shows
* URL
/api/show/
* Method
```
GET
```
* URL Params
None
* Data Params
None
* Success Response
    Code: 200
    Content: {"id":2,"title":"Amateur Night","show_date":"2020-09-30T00:00:00.000Z","show_time":"17:00:00","comics":4,"details":"Amateur Night for new comics","notes":"This is a night for the aspiring up-and-comers to test out their skills!","price_premium":"$20.00","price_general":"$15.00","capacity":150,"comps":5,"tix_id":null,"comic_one":"John Doe","comic_two":"Jane Doe","comic_three":"John Smith","comic_four":"Jane Smith","comic_five":"","comic_six":""},{"id":1,"title":"Show sho!w show","show_date":"2021-07-11T00:00:00.000Z","show_time":"17:50:00","comics":3,"details":"test","notes":"test","price_premium":"$20.00","price_general":"$15.00","capacity":150,"comps":10,"tix_id":null,"comic_one":"Test","comic_two":"Test Comedian","comic_three":"","comic_four":"","comic_five":"","comic_six":""}
* Error Response
    Code: 404 NOT FOUND
    Content: { error: Show doesn't exist }

# Edit Show
Edits existing show
* URL
/api/show/:id
* Method
```
PATCH
```
* URL Params
id=[integer]
* Data Params
None
* Success Response:
    Code: 200
    Content: {"id":1,"title":"SAMPLE TEST SHOW","show_date":"2021-07-11T00:00:00.000Z","show_time":"17:50:00","comics":3,"details":"test","notes":"test","price_premium":"$20.00","price_general":"$15.00","capacity":150,"comps":10,"tix_id":null,"comic_one":"Test","comic_two":"Test Comedian","comic_three":"","comic_four":"","comic_five":"","comic_six":""}
* Error Response
    Code: 400
    Content: { error: Request body must contain 'title', 'show_date', 'show_time', 'comics', 'details', 'notes', 'price_premium', 'price_general', 'capacity', 'comps', 'tix_id', 'comic_one', 'comic_two', 'comic_three', 'comic_four', 'comic_five', 'comic_six' }
    
# Delete Show
Deletes existing show
* URL
/api/show/:id
* Method
```
DELETE
```
* URL Params
id=[integer]
* Data Params
None
* Success Response:
    Code: 204
    Content: none
* Error Response:
    Code: 400
    Content: none

# Comedian List
Returns list of comedians
* URL
/api/comedian/
* Method
```
GET
```
* URL Params
None
* Data Params
None
* Success Response
    Code: 200
    Content: {"id":1,"first_name":"John","last_name":"Smith","phone":"1234567890  ","email":"johnsmith@email.com","bio":"Test bio","notes":"Test notes","category":"showcase","gender":"male","age":25,"race":"white","passed":"0","clean":"1","ssn":"           ","street":"","city":"","st":"  ","zip":"","website":"","facebook":"","twitter":"","instagram":""}
* Error Response
    Code: 404 NOT FOUND
    Content: { error: Comedian doesn't exist }

# Edit Comedian
Edits existing comedian
* URL
/api/comedian/:id
* Method
```
PATCH
```
* URL Params
id=[integer]
* Data Params
None
* Success Response:
    Code: 200
    Content: {"id":1,"first_name":"John","last_name":"Smith","phone":"1234567890  ","email":"johnsmith@email.com","bio":"Test bio","notes":"Test notes","category":"showcase","gender":"male","age":25,"race":"white","passed":"0","clean":"1","ssn":"           ","street":"","city":"","st":"  ","zip":"","website":"","facebook":"","twitter":"","instagram":""
* Error Response
    Code: 400
    Content: { error: Request body must contain 'first_name', 'last_name', 'phone', 'email', 'bio', 'notes', 'category', 'gender', 'age', 'race', 'passed', 'clean', 'ssn', 'street', 'city', 'st', 'zip', 'website', 'facebook', 'twitter', or 'instagram' }
    
# Delete Comedian
Deletes existing comedian
* URL
/api/comedian/:id
* Method
```
DELETE
```
* URL Params
id=[integer]
* Data Params
None
* Success Response:
    Code: 204
    Content: none
* Error Response:
    Code: 400
    Content: none

## Live App
[Alameda Comedy](https://alameda-comedy-client.now.sh/)

## Client Repository
[Alameda Comedy Client-Side Code](https://github.com/klguenth/alameda-comedy-client)
