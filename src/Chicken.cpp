#include "Chicken.h"

Chicken::Chicken() : name(""), breed(""), age(0), notes("") {
}

Chicken::Chicken(const string& name, const string& breed, int age, const string& notes)
    : name(name), breed(breed), age(age), notes(notes) {
}

string Chicken::getName() const {
    return name;
}

string Chicken::getBreed() const {
    return breed;
}

int Chicken::getAge() const {
    return age;
}

string Chicken::getNotes() const {
    return notes;
}

void Chicken::setName(const string& name) {
    this->name = name;
}

void Chicken::setBreed(const string& breed) {
    this->breed = breed;
}

void Chicken::setAge(int age) {
    this->age = age;
}

void Chicken::setNotes(const string& notes) {
    this->notes = notes;
}