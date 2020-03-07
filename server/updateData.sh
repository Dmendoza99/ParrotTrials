#!/bin/sh
LATEST_API="https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml"
HISTORICAL_API="https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml"
LATEST_PATH="~/ParrotTrials/server/latestData.xml"
HISTORICAL_PATH="~/ParrotTrials/server/historicalData.xml"


curl $LATEST_API -o $LATEST_PATH

curl $HISTORICAL_API -o $HISTORICAL_PATH
