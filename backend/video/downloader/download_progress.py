from typing import Dict, List

IN_PROGRESS: Dict[str, Dict[str, int]] = {}

LAST_PACKET_DATA: Dict[str, int] = {}  # {"file_name" : [amount_of_data_downloaded_last_time, time_at_which_packet_was_downloaded]}
