// Entfernt die Tonspur aus einem Video, ohne neu zu rechnen (Bild bleibt unveraendert).
// Aufruf: stumm <eingang.mp4> <ausgang.mp4>
import AVFoundation
let ein = URL(fileURLWithPath: CommandLine.arguments[1])
let aus = URL(fileURLWithPath: CommandLine.arguments[2])
let quelle = AVURLAsset(url: ein)
guard let spur = quelle.tracks(withMediaType: .video).first else { exit(2) }
let film = AVMutableComposition()
let neu = film.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!
try neu.insertTimeRange(CMTimeRange(start: .zero, duration: quelle.duration), of: spur, at: .zero)
neu.preferredTransform = spur.preferredTransform
try? FileManager.default.removeItem(at: aus)
guard let ex = AVAssetExportSession(asset: film, presetName: AVAssetExportPresetPassthrough) else { exit(3) }
ex.outputURL = aus
ex.outputFileType = .mp4
ex.shouldOptimizeForNetworkUse = true
let sem = DispatchSemaphore(value: 0)
ex.exportAsynchronously { sem.signal() }
sem.wait()
exit(ex.status == .completed ? 0 : 1)
