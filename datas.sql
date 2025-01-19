create database login_crud;
use login_crud;
show tables;

create table users;
(
ID int auto_increment primary key,
NAME varchar(100),
EMAIL varchar(100),
PASS varchar(200)
);
select * from users;


