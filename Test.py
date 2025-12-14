import argparse
from scapy.all import sr1, IP, TCP
import nmap
import subprocess

def port_scan(target, ports):
    print(f"Scanning ports on {target}...")

    try:
        nm = nmap.PortScanner()
        nm.scan(target, arguments=f'-p {ports}')
        for host in nm.all_hosts():
            print(f'Host : {host} ({nm[host].hostname()})')
            for proto in nm[host].all_protocols():
                print(f'Protocol : {proto}')
                lport = nm[host][proto].keys()
                for port in lport:
                    print(f'port : {port}   state : {nm[host][proto][port]["state"]}')
    except Exception as e:
        print(f"Error during port scan: {e}")

def password_crack_hash(hash_type, hash_value, wordlist):
    print(f"Cracking {hash_type} hash...")

    try:
        result = subprocess.run(['hashcat', '-m', hash_type, '-a', '0', hash_value, wordlist], capture_output=True, text=True)
        if "Recovered" in result.stdout:
            print("Password cracked!")
            print(result.stdout)
        else:
            print("Password not found in wordlist.")
    except Exception as e:
        print(f"Error during password cracking: {e}")

def network_sniff(interface, count):
    print(f"Sniffing network packets on interface {interface} for {count} packets...")

    try:
        packets = sniffer(interface, count=count)
        for packet in packets:
            print(packet.summary())
    except Exception as e:
        print(f"Error during network sniffing: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simple Hacking Tools")
    parser.add_argument("--target", type=str, help="Target IP address or hostname")
    parser.add_argument("--ports", type=str, help="Ports to scan (e.g., 22,80,443)")
    parser.add_argument("--hash-type", type=str, help="Hash type for password cracking (e.g., 0 for MD5)")
    parser.add_argument("--hash-value", type=str, help="Hash value to crack")
    parser.add_argument("--wordlist", type=str, help="Path to the wordlist file")
    parser.add_argument("--interface", type=str, help="Network interface for packet sniffing")
    parser.add_argument("--count", type=int, help="Number of packets to sniff")

    args = parser.parse_args()

    if args.target and args.ports:
        port_scan(args.target, args.ports)
    elif args.hash_type and args.hash_value and args.wordlist:
        password_crack_hash(args.hash_type, args.hash_value, args.wordlist)
    elif args.interface and args.count:
        network_sniff(args.interface, args.count)
    else:
        print("Please provide the necessary arguments for the desired action.")
