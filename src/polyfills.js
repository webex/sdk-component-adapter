// dummy implementation of getTracks() for non-supporting browsers,
// to avoid checking for its existence before calling it
if (!MediaStream.prototype.getTracks) {
  MediaStream.prototype.getTracks = () => [];
}
