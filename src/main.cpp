#include <iostream>
#include "CoopTracker.h"

using namespace std;

int main() {
    CoopTracker tracker;

    cout << "        ,~.\n";
    cout << "       ('v')\n";
    cout << "      ((___))\n";
    cout << "       ^   ^\n";
    cout << "============================================================\n";
    cout << "                     COOPKEEPER CLI\n";
    cout << "              Chicken Coop Management System\n";
    cout << "============================================================\n\n";
    cout << "Track chickens, eggs, feed, expenses, health, and cleaning.\n";

    tracker.run();

    cout << "\nThanks for using CoopKeeper!\n";
    return 0;
}