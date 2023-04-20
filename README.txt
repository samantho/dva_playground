Project: Team 164 Music Recommender


DESCRIPTION: 
- This package contains the code for our Spotify artist and song recommender. This site is currently live on the
  web, however all code to make it work locally can be found within this download. The installation instructions 
  can be found below. The file structure is organized for ease of running. The webpage is index.html in the main
  code directory. The AWS lambda function is aws.py in the main directory. The css files are in the css 
  directory. The fonts are in the fonts directory. The js is in the js directory. The lib directory contains the 
  d3 library. The videos folder contains visuals. 
- The code, as described in the final report, is a webpage. This webpage, run by hosting the index.html like
  below, contains many project details. It has many sections with blurbs about different aspects of the project,
  such as the Background section. To get artist recommendations, input an artist in the Recommendation section
  of the site. To get song recommendations, input a song right below in the same section. All datasets and the 
  artist algorithm are hosted on the cloud and are easily accessed, so they do not need to be downloaded. The 
  original dataset can be downloaded from the Spotify Million Playlist Dataset challenge website if one desired 
  to do a full replication from scratch.


INSTALLATION:
- download the CODE folder
- open the folder in a terminal
- to run locally, type "python -m http.server 8888 &."
- the site will be live at http://localhost:8888/

- optional: the site is live at https://samantho.github.io/dva_playground/, though song recommendation Spotify 
  API key may not be refreshed

- to change the Spotify API key for the song recommender (expires every hour):
      - sign up for a Spotify Developer Account (free)
      - create an app in your Dashboard
      - get the Client id and Client secret for the app
      - run this curl request to generate a one-hour api key
            curl -X POST "https://accounts.spotify.com/api/token" \
                    -H "Content-Type: application/x-www-form-urlencoded" \
                    -d "grant_type=client_credentials&client_id=your-client-id&client_secret=your-client-secret"
      - on line 286, replace the accessToken with your access token
- alternatively email santhony32@gatech.edu and the live site can be updated with a new key :)

- part of the project includes an AWS Lambda function, which can be found as aws.py in the CODE folder
- this is live and does not need to be replicated, however if one wanted to they could go through AWS tutorials 
  to create a lambda function and connect to API gateway


EXECUTION:
- to run the algorithms, scroll on the page to the Recommender section
- in the Artist Name box, input (case insensitive) the name of a musical artist you wish to get recommendations for
- click submit
- wait approximately 10 seconds
- The recommendation graph will be displayed
- This includes a tooltip for more info and the nodes can be dragged
- once the graph appears, the track selection tool will appear
- select a song and click select track
- after a few seconds, song recommendations for the top artists will be displayed below (if api key is not expired)
- user can continue to select other songs or artists to their heart's content
- click the feedback button to provide feedback