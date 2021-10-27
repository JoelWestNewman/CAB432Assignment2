FROM node:alpine AS client-build
#change directory to the client
WORKDIR /Cab432Assignment2/client

# install the client dependencies
COPY client/package*.json ./
RUN npm install

#copy and build the client
COPY client ./
RUN npm run build

#change to server directory
FROM node:alpine AS server-build
WORKDIR /Cab432Assignment2/server

#install server dependencies
COPY server/package*.json ./
RUN npm install

COPY server ./

COPY --from=client-build /Cab432Assignment2/client/build client

#expose the port that will be used
ENV PORT=8000
EXPOSE 8000

#start the server
CMD ["node", "index.js"]