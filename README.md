# CMSC471-Final-Project
Visualization of K-Center Clustering Algorithms


# Workflow
This project was developed over the course of six weeks from April 2025 - May 2025 as part 
of CMSC471: Introduction to Data Visualization at the University of Maryland. 

The work was mostly partitioned between members by algorithm, although we all helped contribute ideas and troubleshooting.

### Josh
- Found data set used
- Implemented naive solution for K-means
- Implemented naive solution for K-centers
- Wrote explanations and styling/presentation, readme
- Helped troubleshoot and clean code for other visualizations

### Johann
- Came up with idea for project
- Implemented Gonzalez's algorithm
- Wrote explanations and cleaned styling


### Bhuvan
- Implemented Lloyd's algorithm
- Implemented K-means++ algorithm
- Implemented base structure of projection from data set to US map used in all the visualizations, 
- Implemented data clustering used in all other visualizations (points colored according to closest center)
- Wrote explanations for Lloyd / kmeans

Overall, the team spent about 20 hours per person on the project, for a total of about 60 people hours of work. Getting all the buttons to work without any conflicts took the largest amount of time. 

More features (in detail) 

We decided to partition the work for this project by each person to do a different algorithm. Josh found the data set being used, and implemented the brute force algorithms for K-means and K-centers. For the naive algorithms, our visualization lets you walk through the algorithm iteration by iteration through the use of the “Next Iteration”  button. You can select how many centers you want to cluster, the k parameter, and there's a reset button which allows you to reset the progress of the algorithm. Bhuvan came up with the idea of visualizing these algorithms by clustering the points on a U.S map. Johann did the visualization of Gonzalez's algorithm. You can walk through the algorithm iteration by iteration through the use of the “Next Iteration” button. Every iteration the visualization displays the max distance of  any given point to its closest center, which is what the algorithm seeks to optimize. Further, it assigns each cluster a particular color and draws a circle around the cluster and the furthest away point from the cluster’s center. There’s also a reset button which allows you to reset the progress of the algorithm. Bhuvan did the visualization of Lloyd’s algorithm.  You can walk through the algorithm iteration by iteration through the use of the “Next Iteration” button. As each iteration is run, the visualization displays the change in the clusters, by assigning each cluster a particular color. There’s also a reset button which allows you to reset the progress of the algorithm. Josh and Johann completed the descriptions of all the algorithms, and the non-visualization content on the website. 


## AI-Usage
Some comments and styling generated using Github Co-Pilot

## To-Do
- Add expanding boxes with more formal definitions/detailed mathamatical formulas for algorithms.
- Clean style and presentation, add more visuals to opening of article.
- Add graphs to help explain the paragraphs comparing time complexity of algorithms (naive vs lloyd's vs gonzalez's vs means++), accuracy of optimal solution vs approximations
- Change maps / some examples from full USA map to more detailed local examples (e.g. just Prince George's County elementary schools, and the map zoomed in on P.G. county), and add more consistent theming/relevant visuals to help keep a better engaging real-world example as a throughline. 