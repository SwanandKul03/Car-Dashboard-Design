"""Add road context and restrained cabin movement to the supplied concept film.

Usage: python scripts/render-opening-drive.py /absolute/path/to/road-source.mp4
The supplied 35-second dashboard film remains the timing master.
"""
from pathlib import Path
import subprocess,sys,tempfile

root=Path(__file__).resolve().parents[1]
road=Path(sys.argv[1]).resolve()
film=root/'dist/assets/opening-film.mp4'
out=root/'dist/assets/opening-drive.mp4'
# Relative pace follows the visible readout: 22→40 mph, cruise, then 40→30 mph.
# This is an illustrative synchronisation, not calibrated vehicle telemetry.
clock="if(lt(T,6.2),(-22+sqrt(484+180*T))/1.8,if(lt(T,16.6),10+(T-6.2)/0.8,if(lt(T,22.2),23+(0.8-sqrt(max(0,0.64-0.05*(T-16.6))))/0.025,31+(T-22.2)/0.6)))"
velocity="if(lt(t,10),0.55+0.045*t,if(lt(t,23),1,if(lt(t,31),1-(t-23)/32,0.75)))"
x=f"4+({velocity})*(0.8*sin(2*PI*1.4*t)+0.35*sin(2*PI*8.7*t))"
y=f"4+({velocity})*(1.2*sin(2*PI*2.8*t)+0.45*sin(2*PI*13.1*t))"
plate_directory=tempfile.TemporaryDirectory()
plate=Path(plate_directory.name)/"clean-hood.png"
subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-ss","30.5","-i",str(film),"-vf","crop=1920:145:0:0","-frames:v","1","-update","1","-y",str(plate)],check=True)
graph=(
 f"[0:v]trim=start=2:end=26.6,setpts=PTS-STARTPTS,setpts='{clock}/TB',fps=30,crop=1920:400:0:640,setsar=1,eq=brightness=-0.025:saturation=0.76:contrast=1.04,vignette=angle=PI/7[road];"
 "[1:v]fps=30,crop=1920:1140:0:0,setsar=1[cabin-source];"
 "[cabin-source][2:v]overlay=x=0:y=0:shortest=1[clean-cabin];"
 f"[clean-cabin]pad=1928:1148:4:4:color=0x08090b,crop=1920:1140:x='{x}':y='{y}'[cabin];"
 "color=c=0x08090b:s=1920x1498:r=30:d=34.933333[base];"
 "[base][road]overlay=x=0:y=0:shortest=1[context];"
 "[context][cabin]overlay=x=0:y=358:shortest=1,fade=t=in:st=0:d=0.28,fade=t=out:st=34.35:d=0.58,format=yuv420p[out]"
)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','warning','-filter_complex_threads','2','-i',str(road),'-i',str(film),'-loop','1','-framerate','30','-i',str(plate),'-filter_complex',graph,'-map','[out]','-map','1:a:0','-c:v','libx264','-preset','fast','-crf','22','-threads','2','-c:a','copy','-movflags','+faststart','-t','34.933333','-y',str(out)],check=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss','8','-i',str(out),'-frames:v','1','-c:v','libwebp','-quality','88','-update','1','-y',str(root/'dist/assets/opening-drive-poster.webp')],check=True)
plate_directory.cleanup()
print('Rendered the caption-free road-context film and poster.')
