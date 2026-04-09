#include <iostream>
#include "CoopTracker.h"

using namespace std;

int main() {
    CoopTracker tracker;

    cout << "============================================================\n";
    cout << "                       COOPKEEPER\n";
    cout << "             Chicken Flock Management App\n";
    cout << "============================================================\n\n";
    cout << "Track chickens, eggs, feed, expenses, health, and cleaning.\n";

    tracker.run();

    cout << "\nThanks for using CoopKeeper!\n";
    return 0;
}