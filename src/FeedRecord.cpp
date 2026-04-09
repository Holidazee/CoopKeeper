#include "FeedRecord.h"

FeedRecord::FeedRecord() : date(""), feedType(""), quantity(0.0), cost(0.0) {
}

FeedRecord::FeedRecord(const string& date, const string& feedType, double quantity, double cost)
    : date(date), feedType(feedType), quantity(quantity), cost(cost) {
}

string FeedRecord::getDate() const {
    return date;
}

string FeedRecord::getFeedType() const {
    return feedType;
}

double FeedRecord::getQuantity() const {
    return quantity;
}

double FeedRecord::getCost() const {
    return cost;
}

void FeedRecord::setDate(const string& date) {
    this->date = date;
}

void FeedRecord::setFeedType(const string& feedType) {
    this->feedType = feedType;
}

void FeedRecord::setQuantity(double quantity) {
    this->quantity = quantity;
}

void FeedRecord::setCost(double cost) {
    this->cost = cost;
}