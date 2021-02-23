# Task Manager API

A task manager API for managing tasks.

## Features:

- CRUD operation
- Authentication and authorization
- Create private tasks for individual user
- Upload user profile

```
--------------------------------------------------------------------
[Method]    [Route]             [Description]               [Access]
--------------------------------------------------------------------

POST        /users              Register a user             Public
POST        /users/login        Auth user & get token       Public
POST        /users/logout       User logout                 Private
POST        /users/logoutAll    Logout all the users        Private
GET         /users/me           Get user's details          Private
PATCH       /users/me           Update user's details       Private
DELETE      /users/me           Delete user                 Private
POST        /users/me/avatar    Post user profile pic       Private
DELETE      /users/me/avatar    Delete user profile pic     Private
GET         /users/:id/avatar   Get user profile picture    Private

POST        /tasks              Create a new user's task    Private
GET         /tasks              Get all user tasks          Private
GET         /tasks/:id          Get a task details          Private
PATCH       /tasks/:id          Update user's task          Private
DELETE      /tasks/:id          Delete a user's task        Private
-------------------------------------------------------------------
```

Check `package.json` file for more information.
