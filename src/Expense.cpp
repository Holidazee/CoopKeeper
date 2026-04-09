#include "Expense.h"

Expense::Expense() : date(""), category(""), description(""), amount(0.0) {
}

Expense::Expense(const string& date, const string& category, const string& description, double amount)
    : date(date), category(category), description(description), amount(amount) {
}

string Expense::getDate() const {
    return date;
}

string Expense::getCategory() const {
    return category;
}

string Expense::getDescription() const {
    return description;
}

double Expense::getAmount() const {
    return amount;
}

void Expense::setDate(const string& date) {
    this->date = date;
}

void Expense::setCategory(const string& category) {
    this->category = category;
}

void Expense::setDescription(const string& description) {
    this->description = description;
}

void Expense::setAmount(double amount) {
    this->amount = amount;
}