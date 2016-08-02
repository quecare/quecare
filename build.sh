#!/usr/bin/env bash

SERVER_IP='162.243.1.251'

# push code to server
scp -prC 'que/' jideobs@${SERVER_IP}:que/;
scp -pC 'requirements' jideobs@${SERVER_IP}:que/;
