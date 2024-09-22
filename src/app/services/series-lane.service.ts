import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SeriesLaneService {
  // Default lane order, can be customized if needed
  private laneOrder = [4, 5, 3, 6, 2, 7, 1, 8]; // Lane assignment order

  // Method to assign series and lanes dynamically based on number of athletes
  assignSeriesAndLanes(atlets: any[]) {
    let seriesSize: number =0;
    let totalAthletes = atlets.length;
    if (totalAthletes % 8 == 0) {
      seriesSize = 8;
    }else{
      seriesSize = 6;
    }
    let fullSeries = Math.floor(totalAthletes / seriesSize);
    let remainingAthletes = totalAthletes % seriesSize;

    let series = [];

    // Sort athletes by prelimit (fastest to slowest)
    atlets.sort((a, b) => a.prelimit.localeCompare(b.prelimit));

    // Place the fastest athletes into full series starting from the last series
    for (let i = 0; i < fullSeries; i++) {
      series.push(atlets.slice(i * seriesSize, (i + 1) * seriesSize));
    }

    // Add remaining athletes to the first series
    if (remainingAthletes > 0) {
      series.unshift(atlets.slice(totalAthletes - remainingAthletes));
    }

    // Assign lanes within each series
    series.forEach(athletesInSeries => {
      let orderedAthletes = new Array(8);
      for (let j = 0; j < athletesInSeries.length; j++) {
        orderedAthletes[this.laneOrder[j] - 1] = athletesInSeries[j]; // Assign based on lane order
      }

      // Fill empty lanes if fewer than seriesSize athletes
      while (orderedAthletes.length < seriesSize) {
        orderedAthletes.push({
          namaAtlet: '................',
          tanggalLahir: '................',
          prelimit: '................'
        });
      }

      athletesInSeries.splice(0, athletesInSeries.length, ...orderedAthletes); // Update athletes in the correct lane order
    });

    return series; // Return athletes with assigned series and lanes
  }
}
